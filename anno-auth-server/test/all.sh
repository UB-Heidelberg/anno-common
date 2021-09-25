#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function test_all () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/.. || return $?

  local SOCK=
  if [ -z "$ANNO_PORT" ]; then
    SOCK="/tmp/anno.$$.sock"
    export ANNO_PORT="$SOCK"
    [ ! -S "$SOCK" ] || rm --verbose -- "$SOCK" || return $?
  fi

  local DEV_ENV=(
    ANNO_TEST_FX='abort_when_listening'
    )

  setup_session_key || return $?
  env "${DEV_ENV[@]}" ./dev-server.sh || return $?
  [ ! -S "$SOCK" ] || rm --verbose -- "$SOCK" || return $?
}


function setup_session_key () {
  # Abort if key source is not local text file:
  [ -z "${ANNO_AUTH_SESSION_KEY_SOURCE#localTextFile}" ] || return $?
  # Abort if an explicit key param is configured:
  [ -z "$ANNO_AUTH_SESSION_KEY_PARAM" ] || return $?

  local DEST="$HOME/.cache/annosrv/auth"
  mkdir --parents -- "$DEST"
  DEST+='/host_secrets'
  mkdir --parents --mode='a=,u+rwx' -- "$DEST"
  DEST+='/sessions.key'
  head --bytes=30 -- /dev/urandom | base64 >"$DEST" || return $?
  export ANNO_AUTH_SESSION_KEY_PARAM="$DEST"
}










test_all "$@"; exit $?
