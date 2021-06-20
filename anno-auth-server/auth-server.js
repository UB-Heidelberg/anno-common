
require('p-fatal');

const express = require('express');
const {envyConf} = require('envyconf');

const defaultConfig = require('./cfg.defaults.js');
const decideAuthRouterConfig = require('./src/decideAuthRouterConfig');
const fallbackErrorHandler = require('./src/fallbackErrorHandler');
const authRouter = require('./routes/auth');

async function setupExpress() {
  const config = envyConf('ANNO', defaultConfig);
  console.debug('Config:', JSON.stringify(config, null, 2));
  const port = (+config.AUTH_PORT || 0);
  if (port < 1) { throw new RangeError('Unsupported port number: ' + port); }

  const authRouterConfig = await decideAuthRouterConfig(config);

  const app = express();
  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'pug');
  app.use(authRouter(authRouterConfig));
  app.use(fallbackErrorHandler);
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

setupExpress();
