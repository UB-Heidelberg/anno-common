const {envyConf, envyLog} = require('envyconf')
const {truthy} = require('@kba/anno-util')
const {loadPlugins} = require('@kba/anno-util-loaders')

module.exports = function AnnoOptionsMiddleware(cb) {
    const log = envyLog('ANNO', 'options-mw')
    const conf = envyConf('ANNO', {
        DEFAULT_COLLECTION: 'default',
        MIDDLEWARE_PLUGINS: '',
    })

    let collectionProcessor = function(ctx, cb) {
        log.debug('No collectionProcessor defined')
        return cb()
    }

    function AnnoOptionsMiddleware(req, resp, next) {

        req.annoOptions = req.annoOptions || {}

        const options = req.annoOptions

        // Determine collection from header
        // console.log(req.headers)
        // console.log(
        //   req.header('x-anno-collection'),
        //   req.query.collection,
        //   conf.DEFAULT_COLLECTION
        // )
        options.collection = req.header('x-anno-collection') || req.query.collection || conf.DEFAULT_COLLECTION

        collectionProcessor(options, err => {
            if (err) return next(err)

            // boolean values
            ;[
              'metadataOnly',
              'includeDeleted',
              'forceDelete',
              'recursive',
              'latest',
              'replaceAnnotation',
              'updateAnnotation',
            ].forEach(option => {
                const optionHeader = `X-Anno-${option}`.toLowerCase()
                if (option in req.query) {
                    options[option] = truthy(req.query[option])
                    delete req.query[option]
                } else if (optionHeader in req.headers) {
                    options[option] = truthy(req.headers[optionHeader])
                }
            })

            // array values
            ;[
              'filterProps'
            ].forEach(option => {
                const optionHeader = `X-Anno-${option}`.toLowerCase()
                let val = req.query[option]
                if (!val) val = req.headers[optionHeader]
                if (val) options[option] = val
                if (option in req.query) {
                    options[option] = req.query[option].trim().split(/\s*,\s*/)
                    delete req.query[option]
                } else if (optionHeader in req.headers) {
                    options[option] = req.headers[optionHeader].trim().split(/\s*,\s*/)
                }
            })

            // string values
            ;[
              'sort',
            ].forEach(option => {
              const optionHeader = `X-Anno-${option}`.toLowerCase()
              if (option in req.query) {
                options[option] = req.query[option].trim()
                delete req.query[option]
              } else if (optionHeader in req.headers) {
                options[option] = req.headers[optionHeader].trim()
              }
            })

            // number values
            ;[
              'limit',
            ].forEach(option => {
              const optionHeader = `X-Anno-${option}`.toLowerCase()
              if (option in req.query) {
                options[option] = parseFloat(req.query[option])
                delete req.query[option]
              } else if (optionHeader in req.headers) {
                options[option] = parseFloat(req.headers[optionHeader])
              }
            })

            // https://www.w3.org/TR/annotation-protocol/#suggesting-an-iri-for-an-annotation
            if (req.header('slug')) options.slug = req.header('slug')

            // log.silly("annoOptions scraped: " + JSON.stringify(options))
            // console.log("annoOptions scraped: " + JSON.stringify(options))
            next()
        })
    }

    AnnoOptionsMiddleware.unless = require('express-unless')

    loadPlugins(conf.MIDDLEWARE_PLUGINS, {
        loadingModule: module,
        afterLoad(plugin, loaded) {
            collectionProcessor = plugin
            loaded()
        }
    }, cb(null, AnnoOptionsMiddleware))

    return AnnoOptionsMiddleware
}
