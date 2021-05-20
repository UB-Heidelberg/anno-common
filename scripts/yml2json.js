#!/usr/bin/env node

const fs = require('fs')
const parseYAML = require('safeload-yaml-pmb')

function yaml2json(infile) {
    const outfile = infile.replace(/\.ya?ml$/, '') + '.json'
    const obj = parseYAML(fs.readFileSync(infile, {encoding:'utf8'}))
    const str = process.env.YML2JSON_MIN ? JSON.stringify(obj) : JSON.stringify(obj, null, 2)
    fs.writeFileSync(outfile, str, {encoding:'utf8'})
}
process.argv.slice(2).forEach(infile => {
    yaml2json(infile)
})
