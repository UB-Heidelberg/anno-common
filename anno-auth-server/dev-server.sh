#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function dev_server () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local RC=
  for RC in cfg.{"$HOSTNAME",local}.rc; do
    [ ! -f "$RC" ] || source -- "$RC" || return $?$(
      echo "E: Failed to source '$RC', rv=$?" >&2)
  done

  local ANNO_COMMON_DIR="${SELFPATH%/*}"
  # seems to work without -> # lerna bootstrap --hoist || return $?
  local EX="$ANNO_COMMON_DIR/anno-plugins/¤-example.yaml"
  acfg COLLECTION_FILE="${EX//¤/collections}"
  acfg USER_FILE="${EX//¤/users}"

  acfg TEXT_REQUEST="$(cat -- docs/examples/templates/request_form.html)"
  acfg SMTP_HOST="$(hostname --fqdn)"
  acfg SMTP_FROM="$USER@$(hostname --fqdn)"
  acfg SMTP_TO="$ANNO_SMTP_FROM"

  exec node auth-server.js "$@"
}


function acfg () {
  local D=
  for D in "$@"; do
    D="ANNO_$D"
    eval '[ -n "$'"${D%%=*}"'" ] || export "$D"'
  done
}










dev_server "$@"; exit $?
