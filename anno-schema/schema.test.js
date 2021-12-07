// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const tap = require('tap');
const w3cWptFixtures = require('w3c-wpt-annotation-protocol-fixtures-pmb');

const localExampleAnnos = require('../anno-test/fixtures/anno.valid.js');
const schema = require('./schema.js');

const validateSchema = schema.validate;
const validateAnno = validateSchema.Annotation;


tap.test('Basic integrity', t => {
  const nDefs = Object.keys(schema.definitions).length;
  t.equal(nDefs,
    34,
    'Correct amount of definitions');
  t.equal(Object.keys(validateSchema).length,
    nDefs, 'Same amount of validators');
  t.end();
});


tap.test('jsonldContext', t => {
  const jc = schema.jsonldContext;
  t.same(Object.keys(jc), ['@context']);
  t.same(jc['@context'][0], 'http://www.w3.org/ns/anno.jsonld');
  t.end();
});


function validateAnnotations(t, inputsMap, minItems) {
  const cnt = (+inputsMap.size || 0);
  t.plan(cnt + 1);
  inputsMap.forEach(function checkOne(inputData, name) {
    const valid = validateAnno(inputData);
    t.equal(valid, true, 'Valid Annotation: ' + name);
  });
  t.ok(cnt >= minItems, 'Plausibly many examples loaded.');
  t.end();
}


tap.test('W3C WPT example annotations', t => {
  validateAnnotations(t, w3cWptFixtures.allAsMap(), 30);
});


tap.test('Local example annotations', t => {
  validateAnnotations(t, localExampleAnnos, 4);
});


tap.test('openapi respects config', t => {
    process.env.ANNO_OPENAPI_HOST = 'example.org'
    t.equal(schema.openapi.host, process.env.ANNO_OPENAPI_HOST, 'OPENAPI_HOST')
    t.equal(schema.openapi.basePath, process.env.ANNO_OPENAPI_BASEPATH, 'OPENAPI_BASEPATH')
    t.end()
})























/* scroll */
