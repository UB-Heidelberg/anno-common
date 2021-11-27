// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function errorHandler(err, req, resp, next) {
  if (!err) { return next(); }
  const { code } = err;
  if (!Number.isFinite(code)) { return next(); }
  if ((code > 0) && (code < 600)) {
    resp.status(err.code);
    resp.send(err.message);
    return resp.end();
  }
  return next();
}


function factory() { return errorHandler; }

module.exports = factory
