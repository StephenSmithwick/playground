A rust based local LLM client.


## Dependencies

- llama.cpp 
```bash
brew install llama.cpp
```
- rust
```bash
```

## Getting Started

### Setup
Start the local llm:
```bash
llama-server -hf unsloth/Qwen3-0.6B-GGUF --jinja
```
Note, initially this will download and cache the model (size: `378M`).

### Executing Client 
Run the client against the model:
```bash
cargo run
```

### Testing
Run the unit tests:
```bash
cargo test
```
