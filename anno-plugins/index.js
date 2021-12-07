'use strict';

const readYamlSync = require('safeload-yaml-from-file-sync-pmb').r(require);

const {StaticLoader, ConfigReloader} = require('../anno-util-loaders')

const AclProcessor        = require('./acl')
const UserProcessor       = require('./user')
const CollectionProcessor = require('./collection')
const CreatorInjector     = require('./creator-injector')

const examples = {
  collections:    readYamlSync('./collections-example.yaml'),
  users:          readYamlSync('./users-example.yaml'),
};

module.exports = {
    AclProcessor,
    UserProcessor,

    PreCollectionFile:     ConfigReloader(CollectionProcessor, 'COLLECTION_FILE'),
    PreCollectionStatic:   StaticLoader(CollectionProcessor,   'COLLECTION_DATA',   examples.collections),

    PreAclFile:            ConfigReloader(AclProcessor,        'ACL_FILE'),
    PreAclStatic:          StaticLoader(AclProcessor,          'ACL_DATA',   AclProcessor.defaultRules),

    PreUserFile:           ConfigReloader(UserProcessor,       'USER_FILE'),
    PreUserStatic:         StaticLoader(UserProcessor,         'USER_DATA',  examples.users),

    CreatorInjectorFile:   ConfigReloader(CreatorInjector,     'USER_FILE'),
    CreatorInjectorStatic: StaticLoader(CreatorInjector,       'USER_DATA',  examples.users),
};
