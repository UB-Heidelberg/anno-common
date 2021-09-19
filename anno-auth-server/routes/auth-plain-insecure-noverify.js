const AuthBase = require('./auth-base')
const passport = require('passport')
const bodyParser   = require('body-parser')


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
    super(...args)

    const LocalStrategy = require('passport-local').Strategy

    passport.use(new LocalStrategy(function(username, password, done) {
      // // TODO this is a giant hack of course
      // if (username === 'john') return done(null, {id: username})
      // return password === 'anno'
      //   ? done(null, {id: username})
      //   : done(null, false, noSuchUser(username))
      // XXX TODO WARNING this is a wide open stupid security no-no!
      return done(null, {id: username})
    }))

    passport.serializeUser((user, cb) => cb(null, JSON.stringify(user)))
    passport.deserializeUser((userJSON, cb) => cb(null, JSON.parse(userJSON)) )

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
