'use strict';

/*----- PASSPORT -----*/

// Modules
const passport = require('koa-passport');
const Strategy = require('passport-google-oauth20').Strategy;
const config = require('../config/config');
const YAPI = require('./youtube');
const {User, Playlist, Copy} = require('./tables');

// Config for clientID, clientSecret and callbackURL
const strategyConfig = {
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL,
};

// Google passport authentication
passport.use(new Strategy(strategyConfig,

  async function (accessToken, refreshToken, profile, done) {

    // User Information
    const user = {
      name: profile.name,
      displayName: profile.displayName,
      photos: profile.photos[0].value,
      accessToken: accessToken,
      googleId: profile.id
    };

    // refreshToken undefined or "" or null
    if (refreshToken != "undefined" && refreshToken != "" && refreshToken != null) {
      user.refreshToken = refreshToken;
    }

    await User.upsert(user);

    //
    var userGet = (await User.findOne(
      {
        where: {
          googleId: profile.id
        }
      }
    )).dataValues;

    //
    var youApi = new YAPI(config, userGet.accessToken, userGet.refreshToken);

    //
    var data = await youApi.getPlaylistData();

    //
    for (var i = 0; i < data.items.length - 1; i++) {

      var stat = await Copy.findOne({
        where: {
          copyId: data.items[i].id
        }
      });

      if (!stat) {
        var playlist = {
          title: data.items[i].snippet.title,
          description: data.items[i].snippet.description,
          youtubeId: data.items[i].id,
          videos: '',
          thumbnail: data.items[i].snippet.thumbnails.medium.url,
          userId: userGet.googleId
        };

        await Playlist.upsert(playlist);
      }
    }

    return done(null, user);
  })
);

// Creating User for all information
passport.serializeUser(function (user, done) {
  done(null, user.googleId);
});

// Getting all information for google account
passport.deserializeUser(async function (googleId, done) {

  //Getting information about user
  var user = await User.findOne({
    where: {
      googleId: googleId
    },
    attributes: ['id', 'googleId', 'accessToken', 'refreshToken', 'photos', 'displayName', 'interledger']
  });

  done(null, user);
});

// Exporting module server on line 6
module.exports = passport;
