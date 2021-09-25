// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

require('p-fatal');

const express = require('express');
const {envyConf} = require('envyconf');

const defaultConfig = require('./cfg.defaults.js');
const decideAuthRouterConfig = require('./src/decideAuthRouterConfig');
const fallbackErrorHandler = require('./src/fallbackErrorHandler');
const authRouter = require('./routes/auth');
const expressAppUtils = require('../anno-server/src/expressAppUtils.js');

async function setupExpress() {
  const envConfig = envyConf('ANNO', defaultConfig);
  console.debug('Config:', envConfig);
  const authRouterConfig = await decideAuthRouterConfig(envConfig);

  const app = express();
  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'pug');
  app.use(authRouter(authRouterConfig));
  app.use(fallbackErrorHandler);
  await expressAppUtils.listenNow(app, envConfig);
}

setupExpress();
