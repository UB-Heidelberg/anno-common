const annoSchema = require('@kba/anno-schema')
const {envyConf} = require('envyconf')

const makeAutoSel = require('./libAutoselectResponseMimeType');

function makeRouter() {
  const config = envyConf('ANNO')

  function redirHTML(req, rsp) {
    rsp.status(302);
    rsp.header('Location', `${config.BASE_URL}${config.BASE_PATH
      }/dist/swagger-ui/dist/index.html?url=${config.BASE_PATH}/swagger`);
    rsp.end();
  }
  redirHTML.cType = 'text/html';

  const { autoSelHnd, router } = makeAutoSel.makeRouter(annoSchema.openapi);
  autoSelHnd.order = [
    redirHTML,
    ...autoSelHnd.order,
  ];

  return router;
}

module.exports = makeRouter;
