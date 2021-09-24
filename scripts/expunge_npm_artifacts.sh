#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function expunge_npm_artifacts () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local LIST=(
    {,*/}package-lock.json
    {,*/}node_modules/
    )
  local ITEM=
  for ITEM in "${LIST[@]}"; do
    [ -e "$ITEM" ] || continue
    echo "D: rm: $ITEM"
    rm --recursive --one-file-system -- "./$ITEM" || return $?
  done
}





expunge_npm_artifacts "$@"; exit $?
