use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ToolFunction {
    pub name: String,
    pub arguments: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ToolCall {
    #[serde(rename = "type", default = "default_tool_call_type")]
    pub kind: String,
    pub function: ToolFunction,
    pub id: String,
}

fn default_tool_call_type() -> String {
    "function".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Message {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_call_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_calls: Option<Vec<ToolCall>>,
}

impl Message {
    pub fn user(content: impl Into<String>) -> Self {
        Self {
            role: Some("user".to_string()),
            content: Some(Value::String(content.into())),
            ..Self::default()
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct SendOutcome {
    pub finish_reason: Option<String>,
    pub did_respond: bool,
    pub request_messages: Vec<Message>,
}

#[derive(Debug, Default)]
pub struct UiState {
    reason: String,
    content: String,
}

impl UiState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn reset(&mut self) {
        self.reason.clear();
        self.content.clear();
    }

    pub fn reason_part(&mut self, reason: &str) {
        self.reason = reason.to_string();
        println!("\n[reason]\n{}", self.reason);
    }

    pub fn content_part(&mut self, content: &str) {
        self.content = content.to_string();
        println!("\n[content]\n{}", self.content);
    }

    pub fn error(&self, error: &str) {
        eprintln!("\n[error]\n{error}");
    }
}

#[async_trait]
pub trait Agent {
    async fn send(&mut self, messages: Vec<Message>, ui: &mut UiState) -> Result<SendOutcome>;
    fn suggest(&self) -> String;
}

#[cfg(test)]
mod tests {
    use super::Message;

    #[test]
    fn preserves_tool_call_type_for_followup_requests() {
        let message: Message = serde_json::from_value(serde_json::json!({
            "role": "assistant",
            "content": "",
            "tool_calls": [{
                "type": "function",
                "function": {
                    "name": "Python",
                    "arguments": "{\"script\":\"print(1)\"}"
                },
                "id": "call_1"
            }]
        }))
        .unwrap();

        let serialized = serde_json::to_value(message).unwrap();
        assert_eq!(
            serialized["tool_calls"][0]["type"],
            serde_json::Value::String("function".to_string())
        );
    }
}
