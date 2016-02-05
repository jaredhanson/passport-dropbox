var DropboxStrategy = require('../lib/strategy')
  , fs = require('fs');


describe('Strategy#userProfile', function() {
  
  describe('fetched from default endpoint', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      if (url != 'https://api.dropbox.com/1/account/info') { return callback(new Error('incorrect url argument')); }
      if (token != 'token') { return callback(new Error('incorrect token argument')); }
      if (tokenSecret != 'token-secret') { return callback(new Error('incorrect tokenSecret argument')); }
    
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
    }
    
    
    var profile;
  
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '6253282' }, function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });
  
    it('should parse profile', function() {
      expect(profile.provider).to.equal('dropbox');
      expect(profile.id).to.equal('12345678');
      expect(profile.displayName).to.equal('John P. User');
      expect(profile.emails[0].value).to.equal('john@example.com');
    });
  
    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });
  
    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint
  
  describe('error caused by invalid token', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      var body = '{"error": "Access token not found."}';
      callback({ statusCode: 401, data: body });
    }
    
    
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('x-token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal("Access token not found.");
    });
    
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // error caused by invalid token
  
  describe('error caused by invalid token secret', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      var body = '{"error": "Unauthorized"}';
      callback({ statusCode: 401, data: body });
    }
    
    
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('x-token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal("Unauthorized");
    });
    
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // error caused by invalid token secret
  
  describe('error caused by malformed response', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    }
    
    
    var err, profile;
    
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
    
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // error caused by malformed response
  
  describe('internal error', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function verify(){});
    
    strategy._oauth.get = function(url, token, tokenSecret, callback) {
      return callback(new Error('something went wrong'));
    }
    
    
    var err, profile;
    before(function(done) {
      strategy.userProfile('token', 'token-secret', { user_id: '123' }, function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });
  
    it('should not supply profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error
  
});