use anyhow::{Context, Result, bail};
use serde_json::json;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

use crate::tools::{ToolDescription, ToolFunctionDescription, ToolParameter, ToolParameters};

const IMAGE: &str = "python:3-alpine";

pub fn python_tool_description() -> ToolDescription {
    let parameter = ToolParameter {
        name: "script".to_string(),
        kind: "string".to_string(),
        description: "A python3 script to execute".to_string(),
        r#enum: None,
    };

    let mut properties = serde_json::Map::new();
    properties.insert(
        parameter.name.clone(),
        json!({
            "type": parameter.kind,
            "description": parameter.description,
        }),
    );

    ToolDescription {
        kind: "function",
        function: ToolFunctionDescription {
            name: "Python".to_string(),
            description: "Execute Python script".to_string(),
            parameters: ToolParameters {
                kind: "object",
                required: vec!["script".to_string()],
                properties,
            },
        },
    }
}

pub async fn call_python(script: &str) -> Result<String> {
    if script.trim().is_empty() {
        bail!("No script provided");
    }

    let mut child = Command::new("docker")
        .arg("run")
        .arg("-i")
        .arg("--rm")
        .arg(IMAGE)
        .arg("python")
        .arg("-")
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .context("failed to start docker python tool")?;

    if let Some(stdin) = child.stdin.as_mut() {
        stdin
            .write_all(script.as_bytes())
            .await
            .context("failed writing script to python tool")?;
    }

    let out = child
        .wait_with_output()
        .await
        .context("python tool failed to return output")?;

    if !out.status.success() {
        let err = String::from_utf8_lossy(&out.stderr).to_string();
        bail!("python tool failed: {err}");
    }

    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}
