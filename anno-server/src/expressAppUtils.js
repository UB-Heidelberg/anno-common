// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const pify = require('pify');
const smartListen = require('net-smartlisten-pmb');


const eau = {

  async listenNow(app, envConfig, envPrefix) {
    const lsnSpec = smartListen(envConfig[(envPrefix || '') + 'PORT']);
    await pify(cb => app.listen(lsnSpec, cb))();
    console.info('Listening on ' + lsnSpec);
    if (envConfig.TEST_FX === 'abort_when_listening') {
      console.log('TEST_FX: Scheduling exit');
      setTimeout(() => process.exit(0), 500);
    }
  },

};



module.exports = eau;
