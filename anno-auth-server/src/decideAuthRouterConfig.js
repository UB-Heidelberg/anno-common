'use strict';

const getOwn = require('getown');
const promisedFs = require('nofs');

function measure(x) { return (+(x || false).length || 0); }


const EX = async function decide(appCfg) {
  const keySrc = appCfg.AUTH_SESSION_KEY_SOURCE;
  const impl = getOwn(EX.sources, keySrc);
  if (!impl) { throw new Error('Unsupported session key source: ' + keySrc); }
  const param = appCfg.AUTH_SESSION_KEY_PARAM;
  const keyData = await impl(param, appCfg);
  if (!measure(keyData)) { throw new Error('Empty key data'); }
  const arc = {
    backend: appCfg.AUTH_BACKEND,
    sessionMasterKey: keyData,
  };
  return arc;
};


EX.sources = {
  insecureEnv: String,
  localTextFile(param) { return promisedFs.readFile(param, 'UTF-8'); },
  fileDescriptor(param) { return promisedFs.readFile(+param, 'UTF-8'); },
};


module.exports = EX;
