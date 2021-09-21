// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function addCorsHeaders(req, resp, next) {
  const origin = req.get('Origin');
  resp.header('Access-Control-Allow-Origin', (origin || '*'));
  resp.header('Access-Control-Allow-Headers', [
    'Authorization',
    'Content-Type',
    'Prefer',
    'X-Anno-Collection',
    'X-Anno-Context',
    'X-Anno-Metadata',
  ].join(', '));
  resp.header('Access-Control-Allow-Credentials', 'true');
  resp.header('Access-Control-Allow-Methods', [
    'DELETE',
    'GET',
    'HEAD',
    'OPTIONS',
    'PUT',
  ].join(', '));
  resp.header('Access-Control-Expose-Headers', [
    'Allow',
    'Content-Location',
    'Content-Type',
    'ETag',
    'Link',
    'Location',
    'Prefer',
    'Vary',
  ].join(', '));
  return next();
}


function factory() { return addCorsHeaders; }

module.exports = factory;
