A node ink based local LLM client.

## Dependencies

- llama.cpp
```bash
brew install llama.cpp
```

## Getting Started

## Setup

### Llama.cpp hosted models
Currently you must cache all the models locally
```bash
llama-server -hf unsloth/Qwen3-0.6B-GGUF -hf unsloth/Qwen3-1.7B-GGUF -hf unsloth/Qwen3-14B-GGUF --jinja
```

Optionally you can start the local llm for Agentia otherwise it will spawn llama-server in the background:
```bash
llama-server --models-preset ./models.ini
```

### Docker instance
I prefer to use colima:
```bash
colima start
```

## Commands
Node commands:

- `bun install` - Install node dependencies
- `bun compile` - Compile agentia
- `bun dev` - Dev watch
- `bun test` - Not currently setup


## Debugging
Currently we log to json files in the logs directory.
- `errors.json`: Every unhandled errors will be logged before a process summary: `{ "process_end": <pid>, "timestamp": <timestamp>}`
- `chat.json`: Every `request` to the llm and the `response`
- `tools.json`: Every `toolCall` and corresponding `toolResponse`

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
