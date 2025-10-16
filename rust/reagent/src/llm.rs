use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct ChatMessage {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    #[serde(rename = "system_fingerprint")]
    pub system_fingerprint: String,
    pub choices: Vec<Choice>,
    pub timings: Option<Timings>,
    pub usage: Option<Usage>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Choice {
    pub index: u32,
    #[serde(rename = "finish_reason")]
    pub finish_reason: Option<String>,

    #[serde(flatten)]
    pub content: ChoiceContent,
}

/// Unified enum for either a streaming delta or a final message
#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ChoiceContent {
    Delta(Delta),
    Final(Final),
}

/// Streaming updates
#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Delta {
    Content {
        delta: ContentDelta,
    },
    Empty {
        delta: std::collections::HashMap<String, serde_json::Value>,
    },
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ContentDelta {
    Content { content: String },
    Reasoning { reasoning_content: String },
}

/// Final assistant message
#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Final {
    pub message: Message,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Message {
    pub role: String,
    #[serde(flatten)]
    pub content: MessageContent,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MessageContent {
    Both {
        reasoning_content: String,
        content: String,
    },
    ContentOnly {
        content: String,
    },
    ReasoningOnly {
        reasoning_content: String,
    },
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Timings {
    pub cache_n: Option<u32>,
    pub prompt_n: Option<u32>,
    pub prompt_ms: Option<f64>,
    pub prompt_per_token_ms: Option<f64>,
    pub prompt_per_second: Option<f64>,
    pub predicted_n: Option<u32>,
    pub predicted_ms: Option<f64>,
    pub predicted_per_token_ms: Option<f64>,
    pub predicted_per_second: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Usage {
    pub completion_tokens: u32,
    pub prompt_tokens: u32,
    pub total_tokens: u32,
}

#[cfg(test)]
mod tests {
    use super::*; // Import items from the outer scope
    const NO_STREAM: &str = r#"
        {"choices":[{"finish_reason":"stop","index":0,"message":{"role":"assistant","reasoning_content":"model reasoning"}}],"created":1,"model":"gpt-3.5-turbo","system_fingerprint":"b6510","object":"chat.completion","usage":{"completion_tokens":326,"prompt_tokens":14,"total_tokens":340},"id":"id","timings":{"cache_n":13,"prompt_n":1,"prompt_ms":20.325,"prompt_per_token_ms":20.0,"prompt_per_second":49.0,"predicted_n":326,"predicted_ms":3084.0,"predicted_per_token_ms":9.0,"predicted_per_second":105.0}}
        "#;
    const STREAM_START_ROLE: &str = r#"
        {"choices":[{"finish_reason":null,"index":0,"delta":{"role":"assistant","content":null}}],"created":1760602688,"id":"chatcmpl-gQ4FG0Rk3GNW5Gv3fkzErzcbQ9dReaLd","model":"gpt-3.5-turbo","system_fingerprint":"b6510-703f9e32","object":"chat.completion.chunk"}
        "#;
    const STREAM_THINKING: &str = r#"
        {"choices":[{"finish_reason":null,"index":0,"delta":{"reasoning_content":"Okay"}}],"created":1758777189,"id":"chatcmpl-L2v2Gl6NZl443MjXX2LtUNcR6eoUYusk","model":"gpt-3.5-turbo","system_fingerprint":"b6510-703f9e32","object":"chat.completion.message"}
        "#;
    const STREAM_END: &str = r#"
        {"choices":[{"finish_reason":"stop","index":0,"delta":{}}],"created":1758777191,"id":"chatcmpl-L2v2Gl6NZl443MjXX2LtUNcR6eoUYusk","model":"gpt-3.5-turbo","system_fingerprint":"b6510-703f9e32","object":"chat.completion.message","timings":{"cache_n":13,"prompt_n":1,"prompt_ms":17.92,"prompt_per_token_ms":17.92,"prompt_per_second":55.80357142857142,"predicted_n":394,"predicted_ms":2623.392,"predicted_per_token_ms":6.658355329949238,"predicted_per_second":150.18723850648323}}
        "#;
    const STREAM_CONTENT: &str = r#"
        {"choices":[{"finish_reason":null,"index":0,"delta":{"content":"."}}],"created":1758777191,"id":"chatcmpl-L2v2Gl6NZl443MjXX2LtUNcR6eoUYusk","model":"gpt-3.5-turbo","system_fingerprint":"b6510-703f9e32","object":"chat.completion.message"}
    "#;

    #[test]
    fn test_serialization() {
        for response in [
            NO_STREAM,
            STREAM_START_ROLE,
            STREAM_THINKING,
            STREAM_CONTENT,
            STREAM_END,
        ] {
            let message: ChatMessage = serde_json::from_str(response).unwrap();
            let serialized = serde_json::to_string(&message).unwrap();
            let re_message: ChatMessage = serde_json::from_str(&serialized).unwrap();

            assert_eq!(re_message, message);
        }
    }

    #[test]
    fn test_no_stream() {
        let message: ChatMessage = serde_json::from_str(NO_STREAM).unwrap();

        assert_eq!(Some(String::from("stop")), message.choices[0].finish_reason);
        match &message.choices[0].content {
            ChoiceContent::Final(message) => match &message.message.content {
                MessageContent::ReasoningOnly { reasoning_content } => {
                    assert_eq!(reasoning_content, "model reasoning")
                }
                _ => panic!("message did not contain reasoning"),
            },
            _ => panic!("response not final"),
        }
    }

    #[test]
    fn test_stream_thinking() {
        let message: ChatMessage = serde_json::from_str(STREAM_THINKING).unwrap();

        assert_eq!(None, message.choices[0].finish_reason);
        match &message.choices[0].content {
            ChoiceContent::Delta(Delta::Content { delta }) => match delta {
                ContentDelta::Reasoning { reasoning_content } => {
                    assert_eq!(reasoning_content, "Okay")
                }
                _ => panic!("response did not contain reasoning"),
            },
            _ => panic!("response did not contain delta"),
        }
    }

    #[test]
    fn test_stream_content() {
        let message: ChatMessage = serde_json::from_str(STREAM_CONTENT).unwrap();

        assert_eq!(None, message.choices[0].finish_reason);
        match &message.choices[0].content {
            ChoiceContent::Delta(Delta::Content { delta }) => match delta {
                ContentDelta::Content { content } => {
                    assert_eq!(content, ".")
                }
                _ => panic!("response did not contain content"),
            },
            _ => panic!("response did not contain delta"),
        }
    }

    #[test]
    fn test_stream_start() {
        let message: ChatMessage = serde_json::from_str(STREAM_START_ROLE).unwrap();

        assert_eq!(None, message.choices[0].finish_reason);
        match &message.choices[0].content {
            ChoiceContent::Delta(Delta::Empty { delta }) => assert_eq!("assistant", delta["role"]),
            _ => panic!("Expected Empty Content"),
        }
    }

    #[test]
    fn test_stream_end() {
        let message: ChatMessage = serde_json::from_str(STREAM_END).unwrap();

        assert_eq!(Some(String::from("stop")), message.choices[0].finish_reason);
    }
}
