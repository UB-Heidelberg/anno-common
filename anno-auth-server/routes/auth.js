// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const express             = require('express')
const cookieParser        = require('cookie-parser')
const expressSession      = require('express-session')
const morgan              = require('morgan')

const addCorsHeaders = require('../../anno-server/middleware/cors.js')();

module.exports = function createAuthRoute(authConfig) {
  const app = express.Router()
  app.use(morgan('dev'))
  app.use(addCorsHeaders);
  app.use(cookieParser())
  app.use(expressSession({
    secret: authConfig.sessionMasterKey,
    resave: false,
    saveUninitialized: false
  }))

  const AuthRouteBuilderConstructor = require(`./auth-${authConfig.backend}`);
  const authRouteBuilder = new AuthRouteBuilderConstructor(authConfig);
  const authRoute = authRouteBuilder.build();
  app.use(authRoute);

  return app
}
