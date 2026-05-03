const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find user by googleId or email
    let user = await userModel.findOne({
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }]
    });

    if (!user) {
      // Create new user
      user = await userModel.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        username: profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000),
        role: 'user',
        artistRequestStatus: 'none'
      });
    } else {
      // Update existing user
      user.googleId = profile.id;
      user.name = profile.displayName;
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
    }

    // Serialize user id to session
    done(null, user._id);
  } catch (err) {
    done(err, null);
  }
}));

// Serialize user to session
passport.serializeUser((userId, done) => {
  done(null, userId);
});

// Deserialize from session
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await userModel.findById(userId).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
