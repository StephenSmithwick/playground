use anyhow::Result;
use futures_util::StreamExt;
use reqwest::Response;
use serde::{Deserialize, Serialize};

use crate::agents::types::{Message, SendOutcome, ToolCall, UiState};
use crate::logs::log_json_line;

#[derive(Debug, Deserialize, Serialize, Default)]
struct ResponsePart {
    #[serde(default)]
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize, Serialize, Default)]
struct Choice {
    finish_reason: Option<String>,
    delta: Option<Message>,
    message: Option<Message>,
}

#[derive(Default)]
struct Buffers {
    reason: String,
    content: String,
}

pub async fn handle_response(
    res: Response,
    ui: &mut UiState,
) -> Result<(SendOutcome, Option<Message>)> {
    let mut stream = res.bytes_stream();
    let mut buffers = Buffers::default();
    let mut last_finish_reason: Option<String> = None;
    let mut response_message: Option<Message> = None;
    let mut did_respond = false;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        let text = String::from_utf8_lossy(&chunk);

        for raw_line in text.lines() {
            let line = raw_line.trim().trim_start_matches("data:").trim();
            if line.is_empty() || line == "[DONE]" {
                continue;
            }

            let Ok(part) = serde_json::from_str::<ResponsePart>(line) else {
                ui.error(&format!("Unable to parse response line: {line}"));
                continue;
            };

            log_json_line("chat.json", &serde_json::json!({ "response": part }));

            for choice in part.choices {
                if let Some(msg) = choice.message {
                    apply_message(&msg, ui, &mut buffers, &mut did_respond);
                    response_message = Some(merge_message(response_message, msg));
                }
                if let Some(delta) = choice.delta {
                    apply_delta(&delta, ui, &mut buffers, &mut did_respond);
                    response_message = Some(merge_message(response_message, delta));
                }
                if choice.finish_reason.is_some() {
                    last_finish_reason = choice.finish_reason;
                }
            }
        }
    }

    if response_message.is_none() && (!buffers.content.is_empty() || !buffers.reason.is_empty()) {
        response_message = Some(Message {
            role: Some("assistant".to_string()),
            reasoning_content: (!buffers.reason.is_empty()).then_some(buffers.reason.clone()),
            content: (!buffers.content.is_empty())
                .then_some(serde_json::Value::String(buffers.content.clone())),
            ..Message::default()
        });
    }

    Ok((
        SendOutcome {
            finish_reason: last_finish_reason,
            did_respond,
        },
        response_message,
    ))
}

fn apply_delta(delta: &Message, ui: &mut UiState, buffers: &mut Buffers, did_respond: &mut bool) {
    if let Some(reasoning) = &delta.reasoning_content {
        buffers.reason.push_str(reasoning);
        ui.reason_part(&buffers.reason);
    }

    if let Some(content) = &delta.content {
        if let Some(content_text) = content.as_str() {
            buffers.content.push_str(content_text);
            ui.content_part(&buffers.content);
            *did_respond = true;
        }
    }
}

fn apply_message(
    message: &Message,
    ui: &mut UiState,
    buffers: &mut Buffers,
    did_respond: &mut bool,
) {
    if let Some(reasoning) = &message.reasoning_content {
        buffers.reason = reasoning.clone();
        ui.reason_part(&buffers.reason);
    }

    if let Some(content) = &message.content {
        if let Some(content_text) = content.as_str() {
            buffers.content = content_text.to_string();
            ui.content_part(&buffers.content);
            *did_respond = true;
        }
    }
}

fn merge_message(existing: Option<Message>, update: Message) -> Message {
    let mut merged = existing.unwrap_or_default();

    if update.role.is_some() {
        merged.role = update.role;
    }
    if update.name.is_some() {
        merged.name = update.name;
    }
    if update.reasoning_content.is_some() {
        merged.reasoning_content = update.reasoning_content;
    }
    if update.content.is_some() {
        merged.content = update.content;
    }
    if update.tool_call_id.is_some() {
        merged.tool_call_id = update.tool_call_id;
    }
    if let Some(calls) = update.tool_calls {
        merged.tool_calls = Some(merge_tool_calls(merged.tool_calls, calls));
    }

    merged
}

fn merge_tool_calls(existing: Option<Vec<ToolCall>>, mut updates: Vec<ToolCall>) -> Vec<ToolCall> {
    let mut calls = existing.unwrap_or_default();
    calls.append(&mut updates);
    calls
}
