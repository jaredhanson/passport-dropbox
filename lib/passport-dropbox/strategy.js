/**
 * Module dependencies.
 */
var querystring = require('querystring')
  , util = require('util')
  , OAuth2Strategy = require('passport-oauth2').Strategy
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Dropbox authentication strategy authenticates requests by delegating to
 * Dropbox using the OAuth2 protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Dropbox application's client d
 *   - `clientSecret`  your Dropbox application-s client secret
 *   - `callbackURL`   URL to which Dropbox will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new DropboxStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/dropbox/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.dropbox.com/1/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://api.dropbox.com/1/oauth2/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'dropbox';
  this._userProfileURL = options.userProfileURL || 'https://api.dropbox.com/1/account/info';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Dropbox.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *   - `emails`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'dropbox' };
      profile.id = json.uid
      profile.displayName = json.display_name;
      profile.emails = [{ value: json.email }];
      
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
