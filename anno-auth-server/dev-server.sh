#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function dev_server () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local ANNO_COMMON_DIR="${SELFPATH%/*}"
  # seems to work without -> # lerna bootstrap --hoist || return $?
  export ANNO_COLLECTION_FILE="$ANNO_COMMON_DIR$(
    )/anno-server/example_collections_file.json"
  export ANNO_USER_FILE="$ANNO_COMMON_DIR/anno-plugins/users-example.json"
  exec node auth-server.js
}










dev_server "$@"; exit $?
