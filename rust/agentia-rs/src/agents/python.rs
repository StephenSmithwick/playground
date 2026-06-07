use anyhow::Result;
use async_trait::async_trait;
use serde_json::{Value, json};

use crate::agents::response::handle_response;
use crate::agents::types::{Agent, Message, SendOutcome, UiState};
use crate::logs::log_json_line;
use crate::models::{ModelKey, load_local_model};
use crate::tools::python::{call_python, python_tool_description};

pub struct PythonAgent {
    model: crate::models::LocalModel,
    tool_description: crate::tools::ToolDescription,
    messages: Vec<Message>,
}

impl PythonAgent {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            model: load_local_model(ModelKey::Medium).await?,
            tool_description: python_tool_description(),
            messages: Vec::new(),
        })
    }

    async fn run_once(&mut self, ui: &mut UiState) -> Result<(SendOutcome, Option<Message>)> {
        self.model.load().await?;
        let req = json!({
            "messages": &self.messages,
            "tools": [&self.tool_description],
        });

        let res = self.model.chat(req).await?;
        let (mut outcome, message) = handle_response(res, ui).await?;
        outcome.request_messages = self.messages.clone();
        Ok((outcome, message))
    }

    async fn execute_tool_calls(&self, message: &Message) -> Result<Vec<Message>> {
        let mut tool_responses = Vec::new();
        if let Some(tool_calls) = &message.tool_calls {
            for call in tool_calls {
                log_json_line("tools.json", &json!({"toolCall": call}));
                let args: Value = serde_json::from_str(&call.function.arguments)?;
                let script = args
                    .get("script")
                    .and_then(Value::as_str)
                    .unwrap_or_default();
                let stdout = call_python(script).await?;

                let response = Message {
                    role: Some("tool".to_string()),
                    name: Some("Python".to_string()),
                    content: Some(Value::String(stdout)),
                    tool_call_id: Some(call.id.clone()),
                    ..Message::default()
                };

                log_json_line("tools.json", &json!({"toolResponse": response}));
                tool_responses.push(response);
            }
        }

        Ok(tool_responses)
    }
}

#[async_trait]
impl Agent for PythonAgent {
    async fn send(&mut self, messages: Vec<Message>, ui: &mut UiState) -> Result<SendOutcome> {
        self.messages = messages;

        loop {
            let (outcome, response_message) = self.run_once(ui).await?;

            let Some(message) = response_message else {
                return Ok(outcome);
            };

            let tool_calls = message.tool_calls.clone().unwrap_or_default();
            if tool_calls.is_empty() {
                return Ok(outcome);
            }

            let tool_responses = self.execute_tool_calls(&message).await?;
            self.messages.push(message);
            self.messages.extend(tool_responses);
        }
    }

    fn suggest(&self) -> String {
        "Please return the results of this python script: `import random; print(random.randint(1, 6))`"
            .to_string()
    }
}
