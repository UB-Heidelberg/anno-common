// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function sendJsonldContent(req, resp, next) {
  const { jsonld } = resp;
  if (jsonld !== undefined) { resp.send(jsonld); }
  return resp.end();
}


function factory() { return sendJsonldContent; }

module.exports = factory;
