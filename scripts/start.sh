#!/bin/bash

set -euo pipefail

command -v realpath >/dev/null 2>&1 || realpath() { [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"; }
BASEDIR=$(realpath "$(dirname "$0")"/..)

if [ $# -gt 0 ]; then
    EXAM_FILENAME=$(realpath "$1")
else
    EXAM_FILENAME=""
fi

cd "$BASEDIR" && npx --no-install webpack-dev-server --open firefox --env.EXAM_FILENAME="$EXAM_FILENAME"