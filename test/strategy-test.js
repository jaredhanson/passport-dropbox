var assert = require('chai').assert;
var DropboxStrategy = require('passport-dropbox/strategy');

describe('DropboxStrategy', function() {
    var strategy = new DropboxStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
    }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
        if (accessToken != 'token') { return callback(new Error('wrong token argument')); }
        var body = '{ \
          "referral_link": "https://www.dropbox.com/referrals/r1a2n3d4m5s6t7", \
          "display_name": "John P. User", \
          "uid": 12345678, \
          "country": "US", \
          "quota_info": { \
          "shared": 253738410565, \
          "quota": 107374182400000, \
          "normal": 680031877871 \
          }, \
          "email": "john@example.com" \
          }';

        callback(null, body, undefined);
    };

    describe('strategy', function() {
        it('should be named dropbox', function() {
            assert.equal(strategy.name, 'dropbox');
        });
    });

    describe('strategy when loading user profile', function() {
        var profile;

        before(function(done) {
            strategy.userProfile('token', function(err, p) {
                if (err) { return done(err); }
                profile = p;
                done();
            });
        });

        it('should parse profile', function() {
            assert.equal(profile.provider, 'dropbox');
            assert.equal(profile.id, '12345678');
            assert.equal(profile.displayName, 'John P. User');
            assert.equal(profile.emails[0].value, 'john@example.com');
        });

        it('should set raw property', function() {
            assert.isString(profile._raw);
        });

        it('should set json property', function() {
            assert.isObject(profile._json);
        });
    });


    describe('encountering an error', function() {
        var err, profile;

        before(function(done) {
            strategy.userProfile('wrong-token', function(e, p) {
                err = e;
                profile = p;
                done();
            });
        });

        it('should error', function() {
            assert.isNotNull(err);
            assert.equal(err.constructor.name, 'InternalOAuthError');
        });

        it('should not load profile', function() {
            assert.isUndefined(profile);
        });
    });
});
