const {Router} = require('express')
const yaml = require('js-yaml')
const annoSchema = require('@kba/anno-schema')
const {envyConf} = require('envyconf')

module.exports = () => {

    const router = Router()
    const config = envyConf('ANNO')

    const swaggerDef = annoSchema.openapi

    const swaggerDefAsJSON = JSON.stringify(swaggerDef, null, 2)
    function sendJSON(req, resp) {
        resp.status(200)
        resp.header('Content-Type', 'application/json')
        resp.send(swaggerDefAsJSON)
    }

    const swaggerDefAsYAML = yaml.safeDump(swaggerDef)
    function sendYAML(req, resp) {
        resp.status(200)
        resp.header('Content-Type', 'text/yaml')
        resp.send(swaggerDefAsYAML)
    }

    router.get('/json', sendJSON)
    router.get('/yaml', sendYAML)
    router.get('/', (req, resp) => {
        if (req.header('Accept').match('text/html')) {
            resp.status(302)
            resp.header('Location', `${config.BASE_URL}${config.BASE_PATH}/dist/swagger-ui/dist/index.html?url=${config.BASE_PATH}/swagger`)
            return resp.end()
        }
        return (req.header('Accept').match('text/yaml'))
            ? sendYAML(req, resp)
            : sendJSON(req, resp)
    })

    return router
}
