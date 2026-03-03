A node ink based local LLM client.

## Dependencies

- llama.cpp
```bash
brew install llama.cpp
```

## Getting Started

## Setup

### Llama.cpp hosted models
Agentia uses a llama.cpp server in router mode and depends on the server to have a number of models in cache (Found here in OSX: `~/Library/Caches/llama.cpp/`).
You can use `bun download` to download all of the models

Agentia will start the llama server for you in the background if not running with: `llama-server --models-preset ./models.ini`

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
