use anyhow::{Context, Result, bail};
use once_cell::sync::Lazy;
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::process::{Child, Command};
use tokio::sync::Mutex;
use tokio::time::{Duration, sleep};

use crate::logs::log_json_line;

const SERVER_TIMEOUT_MS: u64 = 5000;
const LOCAL: &str = "http://localhost:8080";
const CHAT_URL: &str = "http://localhost:8080/v1/chat/completions";
const HEALTH_URL: &str = "http://localhost:8080/v1/health";
const MODEL_URL: &str = "http://localhost:8080/v1/models";
const LOAD_URL: &str = "http://localhost:8080/v1/models/load";
const UNLOAD_URL: &str = "http://localhost:8080/v1/models/unload";

static SERVER_PROCESS: Lazy<Mutex<Option<Child>>> = Lazy::new(|| Mutex::new(None));

#[derive(Debug, Clone)]
pub struct LocalModel {
    pub id: String,
    client: Client,
}

impl LocalModel {
    pub async fn chat(&self, body: Value) -> Result<Response> {
        let mut request = body;
        request["model"] = Value::String(self.id.clone());
        log_json_line("chat.json", &serde_json::json!({"request": request}));

        self.client
            .post(CHAT_URL)
            .body(request.to_string())
            .send()
            .await
            .context("chat request failed")
    }

    pub async fn load(&self) -> Result<Response> {
        self.client
            .post(LOAD_URL)
            .body(serde_json::json!({"model": self.id}).to_string())
            .send()
            .await
            .context("model load failed")
    }

    #[allow(dead_code)]
    pub async fn unload(&self) -> Result<Response> {
        self.client
            .post(UNLOAD_URL)
            .body(serde_json::json!({"model": self.id}).to_string())
            .send()
            .await
            .context("model unload failed")
    }
}

#[derive(Debug, Deserialize)]
struct ServerHealth {
    status: String,
}

#[derive(Debug, Clone, Deserialize)]
struct FetchModel {
    id: String,
}

#[derive(Debug, Deserialize)]
struct FetchModelsResponse {
    data: Vec<FetchModel>,
}

#[derive(Debug, Clone, Copy)]
pub enum ModelKey {
    Small,
    Medium,
    Large,
    Vision,
}

impl ModelKey {
    fn id(self) -> &'static str {
        match self {
            ModelKey::Small => "unsloth/Qwen3-0.6B-GGUF",
            ModelKey::Medium => "unsloth/Qwen3-1.7B-GGUF",
            ModelKey::Large => "unsloth/Qwen3-14B-GGUF",
            ModelKey::Vision => "stduhpf/google-gemma-3-4b",
        }
    }
}

async fn server_is_down(client: &Client) -> bool {
    let Ok(res) = client.get(HEALTH_URL).send().await else {
        return true;
    };

    if !res.status().is_success() {
        return true;
    }

    let Ok(health) = res.json::<ServerHealth>().await else {
        return true;
    };

    health.status != "ok"
}

async fn start_llm_server(client: &Client) -> Result<()> {
    let mut guard = SERVER_PROCESS.lock().await;
    if guard.is_some() {
        return Ok(());
    }

    if server_is_down(client).await {
        let child = Command::new("llama-server")
            .arg("--models-preset")
            .arg("./models.ini")
            .current_dir(std::env::current_dir().unwrap_or_else(|_| LOCAL.into()))
            .spawn()
            .context("failed to start llama-server")?;

        *guard = Some(child);

        let mut elapsed = 0;
        while server_is_down(client).await {
            if elapsed >= SERVER_TIMEOUT_MS {
                bail!(
                    "unable to startup llama-server within {} ms",
                    SERVER_TIMEOUT_MS
                );
            }
            sleep(Duration::from_millis(500)).await;
            elapsed += 500;
        }
    }

    Ok(())
}

async fn fetch_models(client: &Client) -> Result<Vec<FetchModel>> {
    let res = client
        .get(MODEL_URL)
        .send()
        .await
        .context("failed to fetch model list")?;
    let body = res
        .json::<FetchModelsResponse>()
        .await
        .context("invalid model list response")?;
    Ok(body.data)
}

pub async fn load_local_model(model: ModelKey) -> Result<LocalModel> {
    let client = Client::new();
    start_llm_server(&client).await?;

    let model_id = model.id();
    let models = fetch_models(&client).await?;
    let found = models.iter().any(|m| m.id == model_id);
    if !found {
        bail!("model not found in cache: {model_id}");
    }

    Ok(LocalModel {
        id: model_id.to_string(),
        client,
    })
}

#[derive(Debug, Serialize)]
pub struct ModelMapEntry {
    pub name: &'static str,
    pub id: &'static str,
}

#[allow(dead_code)]
pub fn model_map() -> [ModelMapEntry; 4] {
    [
        ModelMapEntry {
            name: "smallLLM",
            id: ModelKey::Small.id(),
        },
        ModelMapEntry {
            name: "mediumLLM",
            id: ModelKey::Medium.id(),
        },
        ModelMapEntry {
            name: "largeLLM",
            id: ModelKey::Large.id(),
        },
        ModelMapEntry {
            name: "visionLLM",
            id: ModelKey::Vision.id(),
        },
    ]
}
