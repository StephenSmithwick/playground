pub mod python;

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ToolParameter {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#enum: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolDescription {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub function: ToolFunctionDescription,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolFunctionDescription {
    pub name: String,
    pub description: String,
    pub parameters: ToolParameters,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolParameters {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub required: Vec<String>,
    pub properties: serde_json::Map<String, serde_json::Value>,
}
