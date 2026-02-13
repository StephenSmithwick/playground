A node ink based local LLM client.

## Dependencies

- llama.cpp
```bash
brew install llama.cpp
```

## Getting Started

## Setup

### Llama.cpp hosted models
Start the local llm:
```bash
llama-server -hf unsloth/Qwen3-0.6B-GGUF --jinja
```
Note, initially this will download and cache the model (size: `378M`).

### Docker instance
I prefer to use colima:
```bash
colima start
```

## Commands
Node commands:

- `pnpm install` - Install node dependencies
- `pnpm build` - Build package
- `pnpm dev` - Dev watch
- `pnpm gday` - Build and execute


## Debugging
Currently we log `request.json`, `response.json`, and `tools.json`

To play and view a request you may use this curl request:
```
curl http://localhost:8080/v1/chat/completions -d @- << JSON | jq
{
  "messages": [
  	{ "role": "user", "content": "Hello" }
  ]
}
JSON
```
