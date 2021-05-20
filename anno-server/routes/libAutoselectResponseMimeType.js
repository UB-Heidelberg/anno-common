const {Router} = require('express')

const yamlify = require('../../anno-util/yamlify.node')

function makeResponseHandler(cType, data) {
  function hnd(req, rsp) {
    rsp.status(200);
    rsp.header('Content-Type', cType);
    rsp.send(data);
  };
  hnd.cType = cType;
  return hnd;
}

function makeAutoSel(data) {
  const auto = function autoSelectResponse(req, rsp) {
    const accepts = String(req.header('Accept') || '').split(/\s*[;,]\s*/);
    const fallback = auto.order.slice(-1)[0];
    const best = auto.order.find(hnd => accepts.includes(hnd.cType));
    return (best || fallback)(req, resp);
  };
  auto.json = makeResponseHandler('application/json',
    JSON.stringify(data, null, 2));
  auto.yaml = makeResponseHandler('text/yaml', yamlify(data));
  auto.order = [
    auto.yaml,
    auto.json,
  ];
  return auto;
}

makeAutoSel.makeRouter = function makeRouter(data) {
  const autoSelHnd = makeAutoSel(data);
  const router = Router();
  router.get('/json', autoSelHnd.json);
  router.get('/yaml', autoSelHnd.yaml);
  router.get('/', autoSelHnd);
  return { autoSelHnd, router };
};



module.exports = makeAutoSel;
