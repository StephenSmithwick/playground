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

#[derive(Default)]
struct ResponseState {
    buffers: Buffers,
    finish_reason: Option<String>,
    message: Option<Message>,
    did_respond: bool,
}

pub async fn handle_response(
    res: Response,
    ui: &mut UiState,
) -> Result<(SendOutcome, Option<Message>)> {
    let mut stream = res.bytes_stream();
    let mut state = ResponseState::default();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        let text = String::from_utf8_lossy(&chunk);

        for raw_line in text.lines() {
            let Some(line) = response_line(raw_line) else {
                continue;
            };

            handle_response_line(line, ui, &mut state);
        }
    }

    Ok(state.into_result())
}

fn response_line(raw_line: &str) -> Option<&str> {
    let line = raw_line.trim().trim_start_matches("data:").trim();
    (!line.is_empty() && line != "[DONE]").then_some(line)
}

fn handle_response_line(line: &str, ui: &mut UiState, state: &mut ResponseState) {
    let Ok(part) = serde_json::from_str::<ResponsePart>(line) else {
        ui.error(&format!("Unable to parse response line: {line}"));
        return;
    };

    log_json_line("chat.json", &serde_json::json!({ "response": part }));

    for choice in part.choices {
        apply_choice(choice, ui, state);
    }
}

fn apply_choice(choice: Choice, ui: &mut UiState, state: &mut ResponseState) {
    if let Some(msg) = choice.message {
        apply_message(&msg, ui, &mut state.buffers, &mut state.did_respond);
        state.message = Some(merge_message(state.message.take(), msg));
    }
    if let Some(delta) = choice.delta {
        apply_delta(&delta, ui, &mut state.buffers, &mut state.did_respond);
        state.message = Some(merge_message(state.message.take(), delta));
    }
    if choice.finish_reason.is_some() {
        state.finish_reason = choice.finish_reason;
    }
}

fn apply_delta(delta: &Message, ui: &mut UiState, buffers: &mut Buffers, did_respond: &mut bool) {
    if let Some(reasoning) = &delta.reasoning_content {
        buffers.reason.push_str(reasoning);
        ui.reason_part(&buffers.reason);
    }

    if let Some(content) = &delta.content
        && let Some(content_text) = content.as_str()
    {
        buffers.content.push_str(content_text);
        ui.content_part(&buffers.content);
        *did_respond = true;
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

    if let Some(content) = &message.content
        && let Some(content_text) = content.as_str()
    {
        buffers.content = content_text.to_string();
        ui.content_part(&buffers.content);
        *did_respond = true;
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

impl ResponseState {
    fn into_result(mut self) -> (SendOutcome, Option<Message>) {
        if self.message.is_none() && self.buffers.has_output() {
            self.message = Some(self.buffers.into_message());
        }

        (
            SendOutcome {
                finish_reason: self.finish_reason,
                did_respond: self.did_respond,
                request_messages: Vec::new(),
            },
            self.message,
        )
    }
}

impl Buffers {
    fn has_output(&self) -> bool {
        !self.content.is_empty() || !self.reason.is_empty()
    }

    fn into_message(self) -> Message {
        Message {
            role: Some("assistant".to_string()),
            reasoning_content: (!self.reason.is_empty()).then_some(self.reason),
            content: (!self.content.is_empty()).then_some(serde_json::Value::String(self.content)),
            ..Message::default()
        }
    }
}
