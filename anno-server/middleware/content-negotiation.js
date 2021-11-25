// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const jsonldRapper = require('jsonld-rapper')

function factory() {
    const j2r = new jsonldRapper()
    return (req, resp, next) => {
        const accept = req.header('Accept') || ''
        if (accept.match(/text\/(turtle|n3)/)) {
            j2r.convert(resp.jsonld, 'jsonld', 'turtle', (err, turtle) => {
                if (err) return next(err)
                return resp.send(turtle)
            })
            return
        }
        return next()
    }
}

module.exports = factory;
