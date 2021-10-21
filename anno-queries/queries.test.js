// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const tap = require('tap');
const w3cWptFixtures = require('w3c-wpt-annotation-protocol-fixtures-pmb');


const queries = require('./queries');
const fixtures = require('../anno-test/fixtures/anno.valid.js');

const ok = {
  textualHtmlBody:       ['anno5.json'],
  svgSelectorResource:   ['anno30.json'],
  mediaFragmentResource: ['anno23.json'],
};

tap.test('fixture tests', (t) => {
  Object.keys(ok).forEach((query) => {
    ok[query].forEach((fixture) => {
      const pass = queries[query].first(fixtures[fixture]);
      // if (!pass) {
      // console.error(JSON.stringify(fixtures[fixture], null, 2))
      // }
      t.ok(pass, `${fixture} has a ${query}`);
    });
  });
  t.end();
});
