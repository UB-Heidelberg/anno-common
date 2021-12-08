const AuthBase = require('./auth-base')
const passport = require('passport')
const bodyParser = require('body-parser')
const callbackify = require('wrap-sync');
const mapValues = require('lodash.mapvalues');


const logPrefix = 'insecure plain auth:';


async function checkLogin(username, pswdReceived) {
  const unStr = String(username || '');
  const userProfile = { id: username };
  const pswdCheat = 'xyzzy';
  if (pswdReceived === pswdCheat) {
    console.debug(logPrefix, 'checkLogin:', { unStr, pswdCheat });
    return userProfile;
  }
  const pswdExpect = unStr.slice(0, 1) + unStr.length;
  const pswdCorrect = (pswdReceived === pswdExpect);
  console.debug(logPrefix, 'checkLogin:', {
    username,
    pswdExpect,
    pswdReceivedLen: pswdReceived.length,
    pswdCorrect,
  });
  return (pswdCorrect && userProfile);
}


const legacyCallbacks = mapValues({
  checkLogin,
  parseJson(json) { return JSON.parse(json); },
  jsonify(data) { return JSON.stringify(data); },
}, callbackify);



function findUserId(req) { return ((req.user || false).id || ''); }

function getLoginOrLogout(which, req, resp) {
  const {
    debugAuth,
    collectionsAvailable,
  } = req;
  const sessUserName = findUserId(req);
  // const isLoggedIn = Boolean(sessUserName);
  // const wantLoggedIn = (which === 'login');
  resp.render('plain-loginout', {
    sessUserName,
    from: (req.query.from || ''),
    debugAuth,
    collectionsAvailable,
    error: req.flash('error'),
  });
}


module.exports = class AuthPlain extends AuthBase {

  constructor(...args) {
    super(...args);
    // const [authConfig] = args;

    const LocalStrategy = require('passport-local').Strategy
    passport.use(new LocalStrategy(legacyCallbacks.checkLogin));
    passport.serializeUser(legacyCallbacks.jsonify);
    passport.deserializeUser(legacyCallbacks.parseJson);

    this.router.use(passport.initialize())
    this.router.use(passport.session())
    this.router.use(bodyParser.urlencoded({extended: true}))
  }

  determineUser(req) { return findUserId(req); }
  getLogin(req, resp) { getLoginOrLogout('login', req, resp); }

  getLogout(req, resp) {
    resp.redirect('login?from=' + encodeURIComponent(req.query.from || ''));
  }

  postLogin(req, resp, next) {
    console.debug('postLogin:', req.query);
    passport.authenticate('local', {
      successRedirect: req.query.from || 'logout',
      failureRedirect: 'login',
      failureFlash: true,
    })(req, resp, (err, req, resp) => {
      if (err) {
        console.log(err)
        return next(err)
      }
    })
  }

  postLogout(req, resp) {
    req.flash('error')
    req.logout()
    resp.redirect(req.query.from || 'login')
  }

}
