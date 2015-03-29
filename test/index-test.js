var assert = require('chai').assert;
var dropbox = require('passport-dropbox');

describe('passport-dropbox', function() {
  describe('module', function() {
    it('should report a version', function() {
        assert.isString(dropbox.version);
    });
  });
});
