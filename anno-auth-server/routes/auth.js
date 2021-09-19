const express             = require('express')
const cookieParser        = require('cookie-parser')
const expressSession      = require('express-session')
const morgan              = require('morgan')

const addAccessPolicyHeaders = require('../src/addAccessPolicyHeaders.js');


module.exports = function createAuthRoute({backend, sessionMasterKey}) {
  const app = express.Router()
  app.use(morgan('dev'))
  app.use(addAccessPolicyHeaders);
  app.use(cookieParser())
  app.use(expressSession({
    secret: sessionMasterKey,
    resave: false,
    saveUninitialized: false
  }))
  const authRoute = new(require(`./auth-${backend}`))()
  app.use(authRoute.build())

  return app
}
