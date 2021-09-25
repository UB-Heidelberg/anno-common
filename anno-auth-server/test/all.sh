#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function test_all () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/.. || return $?

  local SOCK="/tmp/anno.$$.sock"
  [ ! -S "$SOCK" ] || rm --verbose -- "$SOCK" || return $?
  ANNO_PORT="$SOCK" ANNO_TEST_FX='abort_when_listening' \
    ./dev-server.sh || return $?
  [ ! -S "$SOCK" ] || rm --verbose -- "$SOCK" || return $?
}










test_all "$@"; exit $?
