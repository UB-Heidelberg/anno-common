#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function dev_server () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local BACKEND_DIR="${SELFPATH%/*/*}"
  local CONFIG_DIR="$BACKEND_DIR/config"
  local COLLECTION="$CONFIG_DIR/collections.yaml"
  echo "D: using collections config file: $COLLECTION" >&2
  if [ ! -f "$COLLECTION" ]; then
    COLLECTION="${SELFPATH%/*}/anno-server/example_collections_file.json"
    echo "D: … but it does not exist => using fallback: $COLLECTION" >&2
  fi

  # seems to work without -> # lerna bootstrap --hoist || return $?
  export ANNO_COLLECTION_FILE="$COLLECTION"
  export ANNO_AUTH_BACKEND='plain'
  exec nodejs auth-server.js
}










dev_server "$@"; exit $?
