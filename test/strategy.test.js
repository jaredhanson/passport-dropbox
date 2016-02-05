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
  
});
