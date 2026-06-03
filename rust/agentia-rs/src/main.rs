mod agents;
mod logs;
mod models;
mod tools;

use anyhow::Result;
use clap::Parser;

use crate::agents::{Agent, Message, ProxyAgent, UiState};

#[derive(Debug, Parser)]
#[command(name = "agentia-rs", about = "Rust port of agentia")]
struct Cli {
    #[arg(long)]
    name: Option<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let name = cli.name.unwrap_or_else(|| "Stranger".to_string());

    println!("G'day {name}");
    println!("Type /exit to quit. Submit an empty line to use the suggested prompt.\n");

    let mut agent = ProxyAgent::new().await?;
    let mut ui = UiState::new();

    loop {
        let suggested = agent.suggest();
        println!("Suggested: {suggested}");
        print!("Enter your query: ");
        use std::io::Write;
        std::io::stdout().flush()?;

        let mut query = String::new();
        std::io::stdin().read_line(&mut query)?;
        let query = query.trim().to_string();

        if query == "/exit" {
            break;
        }

        let query = if query.is_empty() { suggested } else { query };
        ui.reset();

        let message = Message::user(query);
        if let Err(err) = agent.send(vec![message], &mut ui).await {
            ui.error(&format!("Request failed: {err}"));
        }

        println!();
    }

    Ok(())
}
