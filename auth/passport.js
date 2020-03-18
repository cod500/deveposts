const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const LoacalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");

//User model
const User = require("../src/models/users");

//Profile model
const Profile = require("../src/models/profiles");

// Google passport setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        urlImage: profile.photos[0].value
      };

      //Check for existing user before creating a new user
      User.findOne({
        googleID: profile.id
      }).then(user => {
        if (user) {
          done(null, user);
        } else {
          new User(newUser).save().then(user => {
            new Profile({
              job: " ",
              school: " ",
              location: " ",
              home: " ",
              goals: " ",
              allowComments: true,
              user: user.id
            }).save();

            done(null, user);
          });
        }
      });
    }
  )
);

//Twitter passport setup
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/auth/twitter/callback",
      includeEmail: true
    },
    (token, tokenSecret, profile, done) => {
      const newUser = {
        twitterID: profile.id,
        firstName: profile.username,
        email: profile.emails[0].value,
        urlImage: profile.photos[0].value
      };

      //Check for exsiting user before creating a new user
      User.findOne({
        twitterID: profile.id
      }).then(user => {
        if (user) {
          done(null, user);
        } else {
          new User(newUser).save().then(user => {
            new Profile({
              job: " ",
              school: " ",
              location: " ",
              home: " ",
              goals: " ",
              allowComments: true,
              user: user.id
            }).save();

            done(null, user);
          });
        }
      });
    }
  )
);

//Local passport setup
module.exports = function(passport) {
  passport.use(
    new LoacalStrategy(async (username, password, done) => {
      let user;
      try {
        user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false);
        }
      } catch (e) {
        return done(e);
      }

      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false);
      }

      return done(null, user);
    })
  );
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});
