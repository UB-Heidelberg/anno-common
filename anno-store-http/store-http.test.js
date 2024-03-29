// XXX start server before
process.env.ANNO_BASE_URL = 'http://localhost:3000'
process.env.ANNO_BASE_PATH = '/anno'

const StoreTestsFramework = require('../anno-store/store-tests-framework.js');

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new StoreTestsFramework(store);

  await StoreTests.store.init()
  await StoreTests.testWipe(t)
  await StoreTests.testCreateGet(t)
  await StoreTests.testReply(t)
  await StoreTests.testRevise(t)
  await StoreTests.testSearch(t)
  await StoreTests.testDelete(t)
  await StoreTests.store.disconnect()

  t.end()
})
