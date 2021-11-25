// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const jsonldRapper = require('jsonld-rapper')

function factory() {
  const j2r = new jsonldRapper()

  function turtleHandler(req, resp, next) {
    j2r.convert(resp.jsonld, 'jsonld', 'turtle', (err, turtle) => {
      if (err) return next(err)
      return resp.send(turtle)
    })
  }

  function contentNegotiationHandler(req, resp, next) {
    const accept = req.header('Accept') || ''
    if (accept.match(/text\/(turtle|n3)/)) {
      return turtleHandler(req, resp, next);
    }

    // No Accept match => continue with default handler
    return next()
  }

  return contentNegotiationHandler;
}

module.exports = factory;
