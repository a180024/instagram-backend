const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = mongoose.model("User");

passport.use(
  new LocalStrategy(
    {
      usernameField: "user[username]",
      passwordField: "user[password]",
    },
    function (username, password, done) {
      User.findOne({ username: username })
        .then(function (user) {
          if (!user || !user.validatePassword(password)) {
            return done(null, false, {
              errors: { "username or password": "is invalid" },
            });
          }

          return done(null, user);
        })
        .catch(done);
    }
  )
);
