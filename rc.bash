#! /bin/bash
export GOPATH=$(go env GOPATH)
export PATH="$PATH:$GOPATH/bin"

# alias kubectl="minikube kubectl --"
eval "$(/opt/homebrew/bin/brew shellenv)"
eval "$(rbenv init - zsh)"
. "$HOME/.cargo/env"
