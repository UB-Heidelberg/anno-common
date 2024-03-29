// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable
    arrow-parens,
    block-spacing,
    brace-style,
    comma-dangle,
    import/newline-after-import,
    import/no-dynamic-require,
    no-path-concat,
    no-shadow,
    object-curly-spacing,
    padded-blocks,
    prefer-const,
    quotes,
    semi,
  */

const pProps = require('p-props');
// const nodeFs = require('fs');

const annoTestFixtValid = require('../anno-test/fixtures/anno.valid.js');

/*  function cbThrow(err) { if (err) { throw err; } }

    function dumpJsonToFile(topic, data) {
      const json = JSON.stringify(data, null, 2);
      nodeFs.writeFile('log.' + topic + '.json', json, cbThrow);
    }
*/

const toImport = {
  type: ['Annotation'],
  body: 'http://body',
  target: 'http://target',
  hasReply: [
    {type: ['Annotation'], body: {value: "Bullshit!"}, creator: "foo@bar.com"}
  ],
  hasVersion: [
    {type: ['Annotation'], body: 'http://bdoy', target: 'http://target'},
    {type: ['Annotation'], body: 'http://body', target: 'http://target'}
  ]
}



const inputs = {
  ...Object.fromEntries(annoTestFixtValid),
};


const newTarget = 'https://foo.example.bar';

module.exports = class StoreTests {

  constructor(store) {
    this.store = store.promisify()
  }

  async testWipe(t) {

    return t.test('wipe', async t => {
      t.plan(2)

      await this.store.wipe()
      t.ok(true, 'wipe worked')

      await this.store.init()
      t.ok(true, 'init worked')

      t.end()

    })

  }

  async testGetByRevId(t) {
    return t.test('get/revId', async t => {
      t.plan(1)
      const {store} = this

      const saved1 = await store.create(inputs.minimalStringTarget)
      const revId = `${saved1.id}~1`
      const byRevId = await store.get(revId)
      t.equal(byRevId.id, revId, `get by revision-id: ${revId}`)

      t.end()
    })
  }

  async testCreateGet(t) {
    return t.test('create/get', async t => {
      t.plan(7)

      const {store} = this

      const saved1 = await store.create(inputs.minimalStringTarget)
      t.ok(true, 'create worked')
      // t.comment(JSON.stringify(saved, null, 2))
      t.equal(saved1.target,
        inputs.minimalStringTarget.target,
        'target kept (string)')

      const {id} = saved1
      const byId = await store.get(id)
      t.equal(byId.id, id, `get by url: ${id}`)
      inputs.minimalStringTarget.id = byId.id

      try {await store.get('DOES-NOT-EXIST')}
      catch (err) {t.equal(err.code, 404, "DOES-NOT-EXIST isnt found")}

      const saved2 = await store.create(inputs.minimalObjectTarget);
      t.equal(saved2.target.source,
        inputs.minimalObjectTarget.target.source,
        'target kept (object)')

      const saved3 = await store.create(inputs.minimalArrayTarget);
      t.equal(saved3.target[0].source,
        inputs.minimalArrayTarget.target[0].source,
        'target kept (array of objects)')

      const saved4 = await store.create(inputs.minimalOaTagBody);
      t.equal(saved4.target, inputs.minimalOaTagBody.target,
        'target kept (string)')

      t.end();
    })
  }

  async testSearch(t) {
    return t.test('search', async t => {
      t.plan(3);

      const {store} = this

      await store.wipe()
      await store.init()
      await pProps(inputs, (i => store.create(i)))

      const foundAll = await store.search()
      // dumpJsonToFile('search.all', foundAll);
      const nExpectedTotal = 4;
      t.equal(foundAll.length, nExpectedTotal,
        nExpectedTotal + ' annotations total in store');

      const someTargetIRI = inputs.minimalStringTarget.target;
      t.equal(typeof someTargetIRI, 'string');
      const foundForIRI = await store.search({ $target: someTargetIRI });
      // dumpJsonToFile('search.found', foundForIRI);
      const nExpectedResults = 3;
      t.equal(foundForIRI.length, nExpectedResults,
        `search ${someTargetIRI} -> ${nExpectedResults}`)

      // TODO how to serialize this in a GET call?
      // cb => store.search({'target.source': {$in: [oldTarget, newTarget]}}, cb),
      // (annos, cb) => {
      //     t.equal(annos.length, 3, `search {target.source: {$in: ${JSON.stringify([oldTarget, newTarget])}}} -> 3`)
      //     cb()
      // },

      t.end()
    })
  }

  async testReply(t) {
    return t.test('reply', async t => {
      t.plan(2)
      const {store} = this

      let saved1 = await store.create(inputs.minimalStringTarget)
      let reply = await store.reply(saved1.id, {body: {value: 'Nonsense!'}})
      let saved2 = await store.get(saved1.id)
      t.equal(reply.id, saved1.id + '.1', 'URL has .1 added')
      t.equal(saved2.hasReply.length, 1, 'now has 1 reply')

      t.end()
    })
  }

  async testRevise(t) {
    return t.test('revise', async t => {
      t.plan(3)
      const {store} = this

      let saved1 = await store.create(inputs.minimalStringTarget)
      const target = newTarget
      const revised1 = await store.revise(saved1.id, Object.assign(saved1, {target}))
      const revId = `${saved1.id}~2`
      let saved2  = await store.get(saved1.id)
      t.equal(revised1.id, revId, `revised revision-id: ${revId}`)
      t.equal(revised1.target, newTarget, 'target updated')
      t.equal(saved2.hasVersion.length, 2, 'now 2 versions')

      t.end()
    })
  }

  async testDelete(t) {
    return t.test('delete', async t => {
      t.plan(7)
      const {store} = this

      await store.wipe()
      await store.init()
      const saved1 = await store.create(inputs.minimalStringTarget);
      const saved2 = await store.create(inputs.minimalObjectTarget);
      // :TODO: Are the next both even required?
      await store.create(inputs.minimalArrayTarget);
      await store.create(inputs.minimalOaTagBody);

      let annos = await store.search()
      t.equal(annos.length, 4, '4 annos before delete')

      const found = await store.get(saved1.id)
      t.equal(found.id, saved1.id, 'still there')

      await store.delete(found.id)

      try {
        await store.get(saved1.id)
        t.fail("This one should be gone")
      } catch (err) {t.equal(err.code, 410, "get on deleted should result in 410 GONE")}

      const found410 = await store.get(saved1.id, {includeDeleted: true})
      t.ok(found410, "includeDeleted => found")

      await store.delete(saved2.id, {forceDelete: true})
      try {await store.get(saved2.id)}
      catch (err) {t.equal(err.code, 404, "Aaaand it's gone (404)")}

      annos = await store.search()
      t.equal(annos.length, 2, '2 anno after delete')

      annos = await store.search({}, {includeDeleted: true})
      t.equal(annos.length, 3, '3 anno after delete including the one set to deleted')

      t.end()
    })
  }

  async testImport(t) {
    return t.test('import', async t => {
      const {store} = this
      t.plan(8)

      const options = {
        replaceAnnotation: true,
        updateAnnotation: false,
        slug: 'foobar3000'
      }

      let got = await store.import(JSON.parse(JSON.stringify(toImport)), options)
      t.equal(got.id, 'http://localhost:3000/anno/foobar3000', 'id okay')
      t.equal(got.hasVersion.length, 2, '2 versions')
      t.equal(got.hasReply.length, 1, '1 reply')
      t.equal(got.hasReply[0].hasVersion.length, 1, 'first reply has one version')

      got = await store.import(toImport, options)
      t.equal(got.id, 'http://localhost:3000/anno/foobar3000', 'id STILL okay')
      t.equal(got.hasVersion.length, 2, 'STILL 2 versions')
      t.equal(got.hasReply.length, 1, 'STILL 1 reply')
      t.equal(got.hasReply[0].hasVersion.length, 1, 'first reply has STILL one version')

      t.end()
    })
  }

  async testAll(t) {
    return t.test('all', async t => {
      const {store} = this
      t.plan(8)
      await store.init()
      await this.testWipe(t)
      await this.testCreateGet(t)
      await this.testGetByRevId(t)
      await this.testReply(t)
      await this.testRevise(t)
      await this.testSearch(t)
      await this.testDelete(t)
      await this.testImport(t)
      await store.disconnect()
      t.end()
    })
  }


}
