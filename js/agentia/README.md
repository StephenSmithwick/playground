A node ink based local LLM client.

## Dependencies

- llama.cpp
```bash
brew install llama.cpp
```

## Getting Started

### Setup
Start the local llm:
```bash
llama-server -hf unsloth/Qwen3-0.6B-GGUF --jinja
```
Note, initially this will download and cache the model (size: `378M`).

Node commands:

- `pnpm install` - Install node dependencies
- `pnpm build` - Build package
- `pnpm dev` - Dev watch
- `pnpm howdy` - Build and execute
