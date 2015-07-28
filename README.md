**NOTE:** Dropbox continues to support OAuth 1.0, but OAuth 2.0 is now
preferred.  Developers are encouraged to use [passport-dropbox-oauth2](https://github.com/florianheinemann/passport-dropbox-oauth2)
when developing new applications.


# Passport-Dropbox

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Dropbox](http://www.dropbox.com/) using the OAuth 1.0 API.

This module lets you authenticate using Dropbox in your Node.js applications.
By plugging into Passport, Dropbox authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-dropbox

## Usage

#### Configure Strategy

The Dropbox authentication strategy authenticates users using a Dropbox account
and OAuth tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a consumer key, consumer secret, and callback URL.

    passport.use(new DropboxStrategy({
        consumerKey: DROPBOX_APP_KEY,
        consumerSecret: DROPBOX_APP_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/dropbox/callback"
      },
      function(token, tokenSecret, profile, done) {
        User.findOrCreate({ dropboxId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'dropbox'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/dropbox',
      passport.authenticate('dropbox'));
    
    app.get('/auth/dropbox/callback', 
      passport.authenticate('dropbox', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-dropbox/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-dropbox.png)](http://travis-ci.org/jaredhanson/passport-dropbox)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
