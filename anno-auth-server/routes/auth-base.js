const jsonwebtoken        = require('jsonwebtoken')
const {envyConf}          = require('envyconf')
const bodyParser          = require('body-parser')
const nodemailer          = require('nodemailer')
const express             = require('express')
const connectFlash        = require('connect-flash')
const {PreCollectionFile} = require('@kba/anno-plugins')


function shortDate() { return String(new Date()).split(' (')[0]; }


function refineSmtpSecure(origSecure, port) {
  const s = String(origSecure);
  if (s === '0') { return false; }
  if (s === 'false') { return false; }
  if (s === '1') { return true; }
  if (s === 'true') { return true; }

  if (port === 25) { return false; } // SMTP
  if (port === 465) { return true; }  // Submission over TLS [RFC8314]
  if (port === 587) { return false; } // Submission [RFC4409]
  return false;
}


function textRequestMail({sessUserName, displayName, collections, email, reasons}) {
  return `
Dear Admin,

a user '${displayName}' (Email: ${email || 'not provided'
  }, ID: ${sessUserName}) has requested access to these collections:${
  collections.map(c => `\n  * ${c}`).join('') || '(none)'}

Reasons given:

${[].concat(reasons).join('')}

If the user is not yet in the users.yml, add an entry such as this:

'${sessUserName}':
  public:
      displayName: "${displayName}"
  rules:
${collections.map(c => `    - [{collection: '${c}'}, {role: 'creator'}] # or 'moderator'`).join('\n')}

Best,
Your Friendly Anno-Mailer`
}

module.exports =
  class AuthBase {

    constructor(config, router=express.Router()) {
      this.router = router
      ;[
        'determineUser',
        'postLogin',
        'postLogout',
        'getLogin',
        'getLogout',
      ].map(fn => {
        if (typeof this[fn] !== 'function')
          throw new Error(`Invalid auth subclass ${this.constructor.name}: Must implement '${fn}'`)
      })

      this.router.use(connectFlash())

      // collectionsAvailable middleware
      const collectionProcessor = PreCollectionFile()
      this.router.use((req, resp, next) => {
        const ctx = {}
        collectionProcessor(ctx, err => {
          req.collectionsAvailable = ctx.collectionsAvailable
          req.collectionConfigFor = ctx.collectionConfigFor
          return next(err)
        })
      })

      // ?from middleware
      this.router.use((req, resp, next) => {
        if (req.query.from && req.query.from !== 'undefined') req.from = req.query.from
        else req.from = ''
        req.debugAuth = 'debugAuth' in req.query
        return next()
      })

    }

    build() {

      const {
        TOKEN_EXPIRATION,
        SMTP_HOST,
        SMTP_PORT,
        SMTP_TO,
        SMTP_FROM,
        SMTP_SECURE,
        TEXT_REGISTER,
        TEXT_REQUEST,
      } = envyConf('ANNO', {
        TOKEN_EXPIRATION: 12 * 60 * 60,
        SMTP_HOST: 'localhost',
        SMTP_PORT: 25,
        TEXT_REGISTER: `<pre>Set the TEXT_REGISTER conf variable to add text here</pre>`,
        TEXT_REQUEST: `<pre>Set the TEXT_REQUEST conf variable to add text here</pre>`,
      })

      const mailTransportCfg = {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: refineSmtpSecure(SMTP_SECURE, SMTP_PORT),
      };
      console.debug('mailTransportCfg:', mailTransportCfg);
      const smtp = nodemailer.createTransport(mailTransportCfg);

      //
      // GET /auth/login
      // POST /auth/login
      //
      this.router.post('/login', (...args) => this.postLogin(...args))
      this.router.get('/login', (...args) => this.getLogin(...args))

      //
      // GET /auth/logout
      // POST /auth/logout
      //
      this.router.post('/logout', (...args) => this.postLogout(...args))
      this.router.get('/logout', (...args) => this.getLogout(...args))

      //
      // GET /auth/token
      //
      this.router.get('/token/:iss', (req, resp, next) => {
        const sessUserName = this.determineUser(req)
        if (!sessUserName) {
          resp.status(401)
          resp.header('Location', `login?from=${req.from}`)
          return resp.send('Not logged in. <a href="../login">You can login here</a>')
        }

        const {iss} = req.params
        if (!req.collectionConfigFor(iss)) {
          return resp.status(404).send(`No such collection '${iss}'`)
        }

        const collectionConfig = req.collectionConfigFor(iss)
        if (!('secret' in collectionConfig)) {
          resp.status(500)
          return next(`No secret configured for issuer '${iss}'`)
        }

        const {secret} = collectionConfig
        const now = Math.floor(Date.now() / 1000)
        const exp = now + (collectionConfig.tokenExpiration || TOKEN_EXPIRATION)

        const token = jsonwebtoken.sign({iss, sub: sessUserName, exp}, secret)
        if (req.xhr) resp.header('X-Token', token)
        resp.send(token)
      })

      //
      // GET /auth/register
      //
      this.router.get('/register', (req, resp, next) => {
        const sessUserName = this.determineUser(req)
        const {collectionsAvailable} = req
        resp.status(200).render('register', {
          from: 'register',
          debugAuth: req.debugAuth,
          sessUserName,
          collectionsAvailable,
          TEXT_REGISTER
        })
      })

      //
      // GET /auth/request
      //
      this.router.get('/request', (req, resp, next) => {
        const sessUserName = this.determineUser(req)
        const success = req.query.ok
        const {collectionsAvailable} = req
        const collectionsSelected = new Set((req.query.c || '').split(',').map(c => c.trim()))
        resp.status(200).render('request', {
          from: 'request',
          debugAuth: req.debugAuth,
          sessUserName,
          collectionsAvailable,
          collectionsSelected,
          success,
          TEXT_REQUEST
        })
      })

      //
      // POST /auth/request
      //
      this.router.post('/request', bodyParser.urlencoded({extended: true}), (req, resp) => {
        const sessUserName = this.determineUser(req)
        const collections = Object.keys(req.body).filter(c => c.match(/^c_/)).map(c => c.substr(2))
        const {displayName, reasons, email} = req.body || 'None'
        const text = textRequestMail({sessUserName, displayName, collections, reasons, email})
        const mail = {
          from: SMTP_FROM,
          to: SMTP_TO,
          subject: `Anno-Registrierung ${sessUserName}`,
          text,
        }
        console.info(shortDate(), 'Trying to send mail for', { sessUserName });
        smtp.sendMail(mail, err => {
          if (err) {
            console.error(shortDate(), 'Failed to send this email:', err)
            console.error('Reason:', err)
          } else {
            console.info(shortDate(), 'Mail was sent for', { sessUserName });
          }
          resp.redirect(`request?ok=1`)
        })
      })

      return this.router
    }
  }

