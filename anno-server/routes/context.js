const {jsonldContext} = require('@kba/anno-schema')

const makeAutoSel = require('./libAutoselectResponseMimeType');

function makeRouter() {
  return makeAutoSel.makeRouter(jsonldContext).router;
}

module.exports = makeRouter;
