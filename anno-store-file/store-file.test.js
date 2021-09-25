// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const { test } = require('tap');
const pify = require('pify');

const StoreTestsFramework = require('../anno-store/store-tests-framework.js');

process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

async function catchErr(f) {
  try {
    await f();
    return false;
  } catch (err) {
    return (err || false);
  }
}


const StoreConstructor = require('.');
const store = new StoreConstructor();
test(StoreConstructor.name, async t => {
  const StoreTests = new StoreTestsFramework(store);

  await StoreTests.store.init()
  await StoreTests.testAll(t)
  // await StoreTests.testWipe()
  // await StoreTests.testCreateGet()
  // await StoreTests.testSearch()
  // await StoreTests.testRevise()
  // await StoreTests.testDelete(t)
  // await StoreTests.testImport(t)
  await StoreTests.store.disconnect()

  await (async function coverageTestEdgeCases() {
    const PT = StoreConstructor.prototype;
    const ctx = {
      dbfilename: 'dummy',
      fs: { unlink(path, unlCb) { unlCb({ name: 'ERR_EXOTIC', path }); } },
    };
    t.same(await catchErr(pify(cb => PT._wipe.call(ctx, cb))),
      { name: 'ERR_EXOTIC', path: 'dummy' });
  }());

  t.end()
})
