process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ''
process.env.ANNO_MONGODB_PORT = `32123`

const StoreTestsFramework = require('../anno-store/store-tests-framework.js');

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new StoreTestsFramework(store);

  await StoreTests.testAll(t)

  t.end()
})
