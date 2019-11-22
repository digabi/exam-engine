#!/bin/bash

. ~/.nvm/nvm.sh
EXAM_ENGINE_DIR=$(realpath ~/exam-engine/)
nvm use "$(cat "$EXAM_ENGINE_DIR"/.nvmrc)"

cd "$EXAM_ENGINE_DIR" && npx --no-install ts-node "$EXAM_ENGINE_DIR"/scripts/create-hvp.ts "$@"
