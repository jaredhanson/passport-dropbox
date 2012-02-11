var vows = require('vows');
var assert = require('assert');
var util = require('util');
var DropboxStrategy = require('passport-dropbox/strategy');


vows.describe('DropboxStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new DropboxStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
    'should be named dropbox': function (strategy) {
      assert.equal(strategy.name, 'dropbox');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new DropboxStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
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
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'dropbox');
        assert.equal(profile.id, '12345678');
        assert.equal(profile.displayName, 'John P. User');
        assert.equal(profile.emails[0].value, 'john@example.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new DropboxStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
