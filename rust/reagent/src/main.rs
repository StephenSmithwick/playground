use anyhow::Result;
use futures::stream::StreamExt;
use tokio::io::AsyncBufReadExt;
use tokio_util::bytes::Bytes;

use colored::Colorize;

mod llm;

fn trim_to_object(s: &str) -> &str {
    match s.find('{') {
        Some(pos) => &s[pos..],
        None => "",
    }
}

async fn process_message(next: reqwest::Result<Bytes>) -> Result<()> {
    let unwrap = next?; // Propagate the error with '?'
    let json_str = trim_to_object(std::str::from_utf8(&unwrap)?); // Also propagate the UTF-8 error
    let message: llm::ChatMessage = serde_json::from_str(json_str)?; // Propagate the deserialization error

    for choice in message.choices {
        match choice {
            llm::Choice {
                content: llm::ChoiceContent::Delta(llm::Delta::Empty { delta: _ }),
                ..
            } => continue,
            llm::Choice {
                content: llm::ChoiceContent::Delta(llm::Delta::Content { delta }),
                ..
            } => match delta {
                llm::ContentDelta::Reasoning { reasoning_content } => {
                    print!("{}", reasoning_content.blue())
                }
                llm::ContentDelta::Content { content } => {
                    print!("{}", content.green())
                }
            },
            llm::Choice {
                finish_reason: Some(finish_reason),
                ..
            } => println!("\n:: {}", String::from(finish_reason).red()),
            _ => println!("Ignoring {:?}", choice),
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let prompt = "Please enter your question:".magenta();
    println!("{}", prompt);
    let mut reader = tokio::io::BufReader::new(tokio::io::stdin());
    let mut buffer = Vec::new();
    let _ = reader.read_until(b'\n', &mut buffer).await;
    let request = std::str::from_utf8(&buffer).unwrap_or("Why is the sky blue?");

    let response = reqwest::Client::new()
        .post("http://localhost:8080/v1/chat/completions")
        .json(&serde_json::json!({
            "messages": [
                {
                    "role": "user",
                    "content": request
                }
            ],
            "stream": true
        }))
        .send()
        .await?;

    let mut byte_stream = response.bytes_stream();

    while let Some(next) = byte_stream.next().await {
        match process_message(next).await {
            Ok(_) => (),
            Err(e) => eprintln!("Error processing message: {:?}", e),
        }
    }

    Ok(())
}
