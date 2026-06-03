use anyhow::Result;
use async_trait::async_trait;
use serde_json::Value;

use crate::agents::planning::PlanningAgent;
use crate::agents::python::PythonAgent;
use crate::agents::types::{Agent, Message, SendOutcome, UiState};
use crate::agents::vision::VisionAgent;

const KICK_MESSAGE: &str =
    "You are very knowledgeable. An expert. Think and respond with confidence.";

pub struct ProxyAgent {
    state: AgentState,
    planning: PlanningAgent,
    python: PythonAgent,
    vision: VisionAgent,
    messages: Vec<Message>,
}

pub enum AgentState {
    Python,
    Planning,
    Vision,
}

impl ProxyAgent {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            state: AgentState::Python,
            planning: PlanningAgent::new().await?,
            python: PythonAgent::new().await?,
            vision: VisionAgent::new().await?,
            messages: Vec::new(),
        })
    }

    fn agent(&self) -> &dyn Agent {
        match self.state {
            AgentState::Python => &self.python,
            AgentState::Planning => &self.planning,
            AgentState::Vision => &self.vision,
        }
    }

    fn agent_mut(&mut self) -> &mut dyn Agent {
        match self.state {
            AgentState::Python => &mut self.python,
            AgentState::Planning => &mut self.planning,
            AgentState::Vision => &mut self.vision,
        }
    }
}

#[async_trait]
impl Agent for ProxyAgent {
    async fn send(&mut self, messages: Vec<Message>, ui: &mut UiState) -> Result<SendOutcome> {
        self.messages = messages;
        let messages_to_send = self.messages.clone();

        let mut outcome = self.agent_mut().send(messages_to_send, ui).await?;

        if outcome.finish_reason.as_deref() != Some("tool_calls") && !outcome.did_respond {
            let mut retry_messages = self.messages.clone();
            retry_messages.push(Message {
                role: Some("developer".to_string()),
                content: Some(Value::String(KICK_MESSAGE.to_string())),
                ..Message::default()
            });

            outcome = self.agent_mut().send(retry_messages.clone(), ui).await?;
        }

        Ok(outcome)
    }

    fn suggest(&self) -> String {
        self.agent().suggest()
    }
}
