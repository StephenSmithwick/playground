use anyhow::Result;
use async_trait::async_trait;
use serde_json::json;

use crate::agents::response::handle_response;
use crate::agents::types::{Agent, Message, SendOutcome, UiState};
use crate::models::{ModelKey, load_local_model};

pub struct PlanningAgent {
    model: crate::models::LocalModel,
}

impl PlanningAgent {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            model: load_local_model(ModelKey::Small).await?,
        })
    }
}

#[async_trait]
impl Agent for PlanningAgent {
    async fn send(&mut self, messages: Vec<Message>, ui: &mut UiState) -> Result<SendOutcome> {
        self.model.load().await?;
        let req = json!({
            "messages": &messages,
            "stream": true,
        });
        let res = self.model.chat(req).await?;
        let (mut outcome, _) = handle_response(res, ui).await?;
        outcome.request_messages = messages;
        Ok(outcome)
    }

    fn suggest(&self) -> String {
        "Give me a short plan for today.".to_string()
    }
}
