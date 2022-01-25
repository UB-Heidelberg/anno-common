const tap = require('tap')
const schema = require('.')
const fs = require('fs')
const fixtures = require('@kba/anno-fixtures')

tap.test('smoketest', t => {
    t.equals(Object.keys(schema.validate).length, Object.keys(schema.definitions).length, 'validate 1:1 definitions')
    t.equals(Object.keys(schema.validate).length, 34, '34 classes in schema')
    t.end()
})

function testFixture(t, type, okOrNotOk, name) {
    const obj = fixtures[type][okOrNotOk][name]
    const validFn = schema.validate[type]
    const valid = validFn(obj)
    t[okOrNotOk](valid, `${okOrNotOk ? 'Valid' : 'Invalid'} ${type}: ${name}`)
    if (process.env.FIXTURE && okOrNotOk === 'ok' && !valid) {
        console.log(JSON.stringify(validFn.errors, null, 2).replace(/^/mg, '\t# '))
    }
}

if (process.env.FIXTURE) {
    const fixture = fixtures
    tap.test(process.env.FIXTURE, t => {
        testFixture(t, ...process.env.FIXTURE.split('/'))
        t.end()
    })
} else Object.keys(fixtures).forEach(type => {
    const cases = fixtures[type]
    const okKeys = Object.keys(cases.ok)
    const notOkKeys = Object.keys(cases.notOk)
    tap.test(type, t => {
        const valid = schema.validate[type]
        t.plan(okKeys.length + notOkKeys.length)
        okKeys.forEach(k => testFixture(t, type, 'ok', k))
        notOkKeys.forEach(k => testFixture(t, type, 'notOk', k))
    })
})

tap.test('openapi respects config', t => {
    process.env.ANNO_OPENAPI_HOST = 'example.org'
    t.equals(schema.openapi.host, process.env.ANNO_OPENAPI_HOST, 'OPENAPI_HOST')
    t.equals(schema.openapi.basePath, process.env.ANNO_OPENAPI_BASEPATH, 'OPENAPI_BASEPATH')
    t.end()
})
