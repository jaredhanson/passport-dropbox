/**
 * Parse profile.
 *
 * References:
 *  - https://www.dropbox.com/developers-v1/core/docs#account-info
 *
 * @param {object|string} json
 * @return {object}
 * @api public
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.id = String(json.uid)
  profile.displayName = json.display_name;
  profile.emails = [{ value: json.email }];
  
  return profile;
};
