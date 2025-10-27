use anyhow::Result;
use futures::stream::StreamExt;
use tokio_util::bytes::Bytes;

use colored::Colorize;

use inquire::Text;

mod llm;

fn parse(bytes: Bytes) -> Result<Option<llm::Response>> {
    let str = std::str::from_utf8(&bytes)?;
    match str.find('{') {
        Some(pos) => Ok(serde_json::from_str(&str[pos..])?),
        None => Ok(None),
    }
}

async fn process_response(response: llm::Response) -> Result<()> {
    for choice in response.choices {
        match choice {
            llm::Choice {
                content: llm::ChoiceContent::Delta(llm::Delta::Empty { delta: _ }),
                ..
            } => println!("\n"),
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

async fn respond(user_prompt: String) -> Result<()> {
    let response = reqwest::Client::new()
        .post("http://localhost:8080/v1/chat/completions")
        .json(&serde_json::json!({
            "messages": [ { "role": "user", "content": user_prompt }],
            "stream": true
        }))
        .send()
        .await?;

    let mut stream = response.bytes_stream();

    while let Some(response) = parse(stream.next().await.expect("content")?)? {
        match process_response(response).await {
            Ok(_) => (),
            Err(e) => eprintln!("Error processing message: {:?}", e),
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    loop {
        let user_prompt = Text::new("Please enter your question")
            .with_help_message("example: Why is the sky blue?")
            .with_default("quit")
            .prompt()?;

        if user_prompt == "quit" {
            break;
        };

        let _ = respond(user_prompt).await;
    }

    Ok(())
}
