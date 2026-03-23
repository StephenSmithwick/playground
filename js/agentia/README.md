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

### WyrmStore context over socket mode

If WyrmStore is running in socket mode, Agentia will route each turn through it before calling the LLM. By default Agentia will auto-detect `/tmp/memoryd.sock`.

You can also configure it explicitly:

```bash
AGENTIA_WYRMSTORE_SOCKET_PATH=/tmp/memoryd.sock \
AGENTIA_WYRMSTORE_TOPIC_ID=agentia \
bun run ./source/cli.tsx
```

Agentia sends the running conversation to WyrmStore, uses the returned `messages` array for the LLM request, and keeps the assistant reply in local history for the next turn.

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
