#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function ci_test () {
  local REPO_DIR="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_DIR" || return $?
  [ -f 'mkdocs.yml' ] || return $?$(
    echo 'E: Failed to determine REPO_DIR' >&2)

  npm install --global npm@7 || return $?
  ./install.sh || return $?
  vdo npm test || return $?
}


function vdo () {
  echo '·'
  echo "----- 8< --== $* ==-- 8< ----- 8< ----- 8< ----- 8< ----- 8< -----"
  "$@" || return $?$(echo "E: rv=$? for $*" >&2)
  echo "----- >8 --== $* ==-- >8 ----- >8 ----- >8 ----- >8 ----- >8 -----"
  echo '·'
}


ci_test "$@"; exit $?
