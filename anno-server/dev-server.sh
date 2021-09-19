#!/bin/bash
export ANNO_MIDDLEWARE_PLUGINS='
  @kba/anno-plugins:PreCollectionStatic
  '
export ANNO_STORE_HOOKS_PRE='
  @kba/anno-plugins:PreUserStatic,
  @kba/anno-plugins:PreAclStatic,
  @kba/anno-plugins:CreatorInjectorStatic
  '
export ANNO_STORE_HOOKS_POST='
  @kba/anno-plugins:CreatorInjectorStatic
  '
export ANNO_COLLECTION_FILE='example_collections_file.json'
exec nodejs server.js
