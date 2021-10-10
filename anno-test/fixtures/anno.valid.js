// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const mergeOpt = require('merge-options');

const valid = new Map();

function reg(key, ...sources) {
  const anno = mergeOpt({ id: '' }, ...sources, {
    id: 'http://anno.test/' + key,
  });
  valid.set(key, anno);
  return anno;
}

const minStrTgt = reg('minimalStringTarget', {
  target: 'http://cat/',
  body: { type: 'TextualBody', value: 'meow! string!' },
});

reg('minimalObjectTarget', minStrTgt, {
  target: { source: minStrTgt.target },
  body: { value: 'meow! object!' },
});

reg('minimalArrayTarget', minStrTgt, {
  target: [
    { source: minStrTgt.target },
    { source: 'http://dog/' },
  ],
  body: { value: 'meow! array!' },
});

reg('minimalOaTagBody', {
  body: { type: ['oa:Tag'] },
  target: "http://oa-tag.example.net/",
});


module.exports = valid;
