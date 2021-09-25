// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

require('p-fatal');

const express = require('express');
const { envyConf } = require('envyconf');
const fs = require('fs');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const pProps = require('p-props');
const pify = require('pify');
const absPath = require('absdir')(module, '.');

const annoStoreLoader = require('@kba/anno-store');
const annoPluginsLoader = require('@kba/anno-util-loaders');

const annoRouteFactory = require('./routes/anno');
const swaggerRouteFactory = require('./routes/swagger');
const expressAppUtils = require('./src/expressAppUtils.js');

const middlewareFactories = {
  /* eslint-disable global-require */
  annoOptions:      require('./middleware/anno-options.js'),
  userAuth:         require('./middleware/user-auth.js'),
  aclMetadata:      require('./middleware/acl-metadata.js'),
  cors:             require('./middleware/cors.js'),
  errorHandler:     require('./middleware/error-handler.js'),
  /* eslint-enable global-require */
};


async function prepareMiddlewares(factory, mwName) {
  console.info('Init middleware:', mwName);
  const mware = await factory();
  return mware;
}


const envConfig = envyConf('ANNO', {
  LOGLEVEL: 'debug',
  PORT: '33321',
  BASE_URL: 'http://localhost:33321/',
  BASE_PATH: '',
  STORE: '@kba/anno-store-file',
  DIST_DIR: absPath('public'),
  ENABLE_JWT_AUTH: 'true',
  REQUEST_PAYLOAD_MAX_SIZE_MIBIBYTES: '16',
  TEST_FX: '',
});
console.info('Anno server envConfig:', envConfig);


async function startServer() {
  console.debug({ envConfig });
  const app = express();
  app.set('trust proxy', 'loopback');

  app.use(bodyParser.json({
    type: '*/*',
    limit: ((+envConfig.REQUEST_PAYLOAD_MAX_SIZE_MIBIBYTES
      || 16) * 1024 * 1024),
  }));

  app.use(morgan('short', {
    // eslint-disable-next-line no-unused-vars
    skip(req, res) {
      return ((req.method === 'OPTIONS')
        || (req.originalUrl === '/anno/acl'));
    },
  }));

  console.info('Init store:');
  const store = annoStoreLoader.load({
    loadingModule: module,
    loadPlugins: annoPluginsLoader.loadPlugins,
  });
  await pify(cb => store.init(cb))();
  console.info('Store ready.');

  const middlewares = await pProps(middlewareFactories, prepareMiddlewares);
  app.use(middlewares.cors);

  const serveStaticFiles = express.static(envConfig.DIST_DIR);
  app.use('/dist', serveStaticFiles);
  app.use('/favicon.ico', serveStaticFiles);

  const annoRouteMiddlewares = [
    middlewares.annoOptions,
    (envConfig.ENABLE_JWT_AUTH && middlewares.userAuth),
    middlewares.aclMetadata,
  ].filter(Boolean).map(mw => mw.unless({ method:'OPTIONS' }));
  const annoRoute = annoRouteFactory({ store });
  app.use('/anno', ...annoRouteMiddlewares, annoRoute);

  const swaggerRoute = swaggerRouteFactory();
  app.use('/swagger', swaggerRoute);

  // Fallback for GET: Redirect /:id to /anno/:id for pretty short URL
  // eslint-disable-next-line no-unused-vars
  app.get('/:id', (req, resp, next) => {
    resp.header('Location', `anno/${req.params.id}`);
    resp.status(302);
    resp.end();
  });

  app.use(middlewares.errorHandler);
  await expressAppUtils.listenNow(app, envConfig);
}

startServer();
