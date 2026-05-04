const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const userModel = require('../models/user.model');

const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase()) : [];

const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'https://music-app-0r90.onrender.com/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL,
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
        role: adminEmails.includes(profile.emails[0].value.toLowerCase()) ? 'admin' : 'user',
        artistRequestStatus: 'none'
      });
    } else {
      // Update existing user role if admin email
      if (adminEmails.includes(profile.emails[0].value.toLowerCase()) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
      user.googleId = profile.id;
      user.name = profile.displayName;
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;

