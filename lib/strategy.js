// Load modules.
var OAuthStrategy = require('passport-oauth1')
  , util = require('util')
  , querystring = require('querystring')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth1').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Dropbox authentication strategy authenticates requests by delegating to
 * Dropbox using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to Dropbox
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which Dropbox will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new DropboxStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/dropbox/callback'
 *       },
 *       function(token, tokenSecret, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://api.dropbox.com/1/oauth/request_token';
  options.accessTokenURL = options.accessTokenURL || 'https://api.dropbox.com/1/oauth/access_token';
  var params = { oauth_callback: options.callbackURL };
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://www.dropbox.com/1/oauth/authorize?' + querystring.stringify(params);
  options.sessionKey = options.sessionKey || 'oauth:dropbox';

  OAuthStrategy.call(this, options, verify);
  this.name = 'dropbox';
}

// Inherit from `OAuthStrategy`.
util.inherits(Strategy, OAuthStrategy);


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
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  this._oauth.get('https://api.dropbox.com/1/account/info', token, tokenSecret, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      
      if (json && json.error) {
        return done(new Error(json.error));
      }
      
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider = 'dropbox';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
}

/**
 * Parse error response from Dropbox OAuth endpoint.
 *
 * @param {string} body
 * @param {number} status
 * @return {Error}
 * @access protected
 */
Strategy.prototype.parseErrorResponse = function(body, status) {
  var json;
  
  try {
    json = JSON.parse(body);
    if (json.error) {
      return new Error(json.error);
    }
  } catch (_) {}
};


// Expose constructor.
module.exports = Strategy;
