use anyhow::{Context, Result, bail};
use async_trait::async_trait;
use base64::Engine;
use regex::Regex;
use serde_json::json;

use crate::agents::response::handle_response;
use crate::agents::types::{Agent, Message, SendOutcome, UiState};
use crate::models::{ModelKey, load_local_model};

pub struct VisionAgent {
    model: crate::models::LocalModel,
    image_regex: Regex,
}

impl VisionAgent {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            model: load_local_model(ModelKey::Vision).await?,
            image_regex: Regex::new(r"^\{\{(?P<file>[^.]+)\.(?P<ext>[^}]+)\}\}(?P<text>.*)")?,
        })
    }

    fn transform_test_message(&self, mut message: Message) -> Result<Message> {
        const TEST_IMAGES: [&str; 3] = ["fish.png", "coffee.png", "screenshot.jpeg"];

        let Some(content) = &message.content else {
            return Ok(message);
        };
        let Some(content_str) = content.as_str() else {
            return Ok(message);
        };

        let Some(caps) = self.image_regex.captures(content_str) else {
            return Ok(message);
        };

        let file = caps.name("file").map(|m| m.as_str()).unwrap_or_default();
        let ext = caps.name("ext").map(|m| m.as_str()).unwrap_or_default();
        let text = caps.name("text").map(|m| m.as_str()).unwrap_or_default();
        let image = format!("{file}.{ext}");

        if !TEST_IMAGES.contains(&image.as_str()) {
            bail!("Please use an image from: {:?}", TEST_IMAGES);
        }

        let path_candidates = [
            std::path::Path::new("tests").join(&image),
            std::path::Path::new("../tests").join(&image),
        ];

        let image_path = path_candidates
            .iter()
            .find(|p| p.exists())
            .cloned()
            .context("unable to find test image fixture path")?;

        let bytes = std::fs::read(&image_path)
            .with_context(|| format!("failed reading image fixture: {}", image_path.display()))?;
        let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);

        message.content = Some(json!([
            {
                "type": "image_url",
                "image_url": {
                    "url": format!("data:image/{ext};base64,{encoded}"),
                    "detail": "auto"
                }
            },
            {
                "type": "text",
                "text": text
            }
        ]));

        Ok(message)
    }
}

#[async_trait]
impl Agent for VisionAgent {
    async fn send(&mut self, messages: Vec<Message>, ui: &mut UiState) -> Result<SendOutcome> {
        let transformed = messages
            .into_iter()
            .map(|m| self.transform_test_message(m))
            .collect::<Result<Vec<_>>>()?;

        self.model.load().await?;
        let req = json!({
            "messages": transformed,
        });
        let res = self.model.chat(req).await?;
        let (outcome, _) = handle_response(res, ui).await?;
        Ok(outcome)
    }

    fn suggest(&self) -> String {
        "{{fish.png}} Please describe the image.".to_string()
    }
}
