#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function install_cli () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local NM_KBA='node_modules/@kba'

  case "$1" in
    --func ) shift; "$@"; return $?;;
  esac

  check_missing_os_packages || return $?
  verify_npm_version || return $?

  echo "D: npm install monorepo:"
  npm install . || return $?$(echo "E: npm failed, rv=$?" >&2)
  npm run each_subpkg npm install . || return $?
}


function vdo () { echo -n "D: $*: "; "$@"; }


function check_missing_os_packages () {
  vdo rapper --version && return 0

  local PKG='raptor2-utils'
  if [ "$(whoami)" == root ]; then
    echo "D: Rapper not found. Trying to install it:"
    apt update
    apt install --yes "$PKG"
    vdo rapper --version && return 0
  fi

  echo "E: Please apt-get install $PKG" >&2
  return 3
}


function smart_symlink_to () {
  local LINK="$1" DEST="$2"
  [ -L "$LINK" ] && rm -- "$LINK"
  mkdir --parents -- "$(dirname -- "$LINK")"
  ln --symbolic --no-target-directory -- "$DEST" "$LINK" || return $?
  echo
  ls -ldF --color=always -- "$LINK"
  ls -ldF --color=always -- "$DEST" 2>/dev/null
  echo
}


function internally_symlinkify_kba_deps () {
  echo -n "D: $FUNCNAME: "
  local SUB=
  mkdir --parents -- "$NM_KBA"
  for SUB in [a-z]*/package.json; do
    SUB="$(dirname -- "$SUB")"
    echo -n "$SUB, "
    smart_symlink_to "$NM_KBA/$SUB" ../../"$SUB"
    smart_symlink_to "$SUB/$NM_KBA" ../../"$NM_KBA"
  done
  echo 'all done.'
}


function dbg_ls () { ls -laF -- "$@"; }


function warnbox () {
  local B=
  printf -v B '% 72s' ''
  B="${B// /!}"
  ( echo "$B"
    echo
    printf '  %s\n' "$@"
    echo
    echo "$B"
  ) | sed -re 's~\s+$~~;s~^~W:  !!~' >&2
}


function maybe_prepare_pkglock_for_lerna () {
  echo "D: $FUNCNAME: CI='$CI'"
  [ "$CI" == true ] || return 0
  # internally_symlinkify_kba_deps || return $?

  local SLY="$SELFPATH/node_modules/safeload-yaml-pmb"
  [ -d "$SLY" ] || warnbox "Not yet installed: $SLY" \
    "Try installing the monorepo toplevel package first."

  for SUB in [a-z]*/package.json; do
    SUB="$(dirname -- "$SUB")"
    echo; echo
    echo "D: create package-lock.json for $SUB:"
    cd -- "$SELFPATH/$SUB" || return $?
    [ ! -L "$NM_KBA" ] || rm -- "$NM_KBA" || echo \
      "W: Cannot remove the @kba symlink. Lerna will probably flinch." >&2
    # dbg_ls "$SUB"/node_modules/.staging/@kba/ anno-common/anno-errors
    v_npm_install_current_directory || return $?
  done

  cd -- "$SELFPATH" || return $?
  echo
  echo
  echo "D: $FUNCNAME: success"
  echo
  echo
}


function verify_npm_version () {
  local NPM_VERSION="$(npm --version)"
  local NPM_MAJOR_VERSION="${NPM_VERSION%%.*}"
  [ "$NPM_MAJOR_VERSION" -ge 7 ] || return 4$(
    echo "E: npm --version reports '$NPM_VERSION'," \
      "but we need npm v7 or later to make lerna work." >&2)
}








install_cli "$@"; exit $?
