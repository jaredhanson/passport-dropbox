var chai = require('chai')
  , DropboxStrategy = require('../lib/strategy');


describe('Strategy', function() {
  
  describe('constructed', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'secret'
    }, function(){});
    
    it('should be named dropbox', function() {
      expect(strategy.name).to.equal('dropbox');
    });
  })
  
  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new DropboxStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  })
  
  describe('error caused by invalid consumer key sent to request token URL', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'invalid-secret'
    }, function verify(){});
    
    strategy._oauth.getOAuthRequestToken = function(params, callback) {
      callback({ statusCode: 401, data: '{"error": "Invalid app key (consumer key). Check your app\'s configuration to make sure everything is correct."}' });
    }
    
    
    var err;
  
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.session = {};
        })
        .authenticate();
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal("Invalid app key (consumer key). Check your app's configuration to make sure everything is correct.");
    });
  });
  
  describe('error caused by invalid consumer secret sent to request token URL', function() {
    var strategy = new DropboxStrategy({
      consumerKey: 'ABC123',
      consumerSecret: 'invalid-secret'
    }, function verify(){});
    
    strategy._oauth.getOAuthRequestToken = function(params, callback) {
      callback({ statusCode: 401, data: '{"error": "Unauthorized"}' });
    }
    
    
    var err;
  
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.session = {};
        })
        .authenticate();
    });
  
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal("Unauthorized");
    });
  });
  
});
