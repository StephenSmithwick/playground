# agentia-rs

Rust port of `agentia` with equivalent core behavior:

- Connects to local `llama-server` (`/v1/chat/completions`)
- Starts `llama-server --models-preset ./models.ini` when needed
- Streams and prints reasoning/content output
- Supports test infrarastructure for image aware models: `{{fish.png}} ...`
- Includes Python tool-call execution through Docker (`python:3-alpine`)

## Run

From the repository root:

```bash
cd agentia-rs
cargo run -- --name Jane
```

Then enter a query in the terminal. Use `/exit` to quit.

### Docker instance for Tool Calling
A docker client and server must be available, I prefer to use colima:

```bash
colima start
```

## Notes

- This crate expects `models.ini` to exist at the repo root 
- Vision test fixtures are read from `tests/`.
- Logs are written to `logs/` as JSON lines (`chat.json`, `tools.json`).
