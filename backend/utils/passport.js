const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
const { generateToken } = require("./jwt");
require("dotenv").config();

/* ================= GOOGLE STRATEGY ================= */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ LOCAL callback (NO Render / Vercel)
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
        }

        const token = generateToken(user);

        done(null, {
          user: { id: user._id, email: user.email },
          token,
        });
      } catch (err) {
        console.error("Google Strategy error:", err);
        done(err, null);
      }
    }
  )
);

/* ================= JWT STRATEGY ================= */
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select("-password");
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      console.error("JWT Strategy error:", err);
      return done(err, false);
    }
  })
);

/* ================= SESSION ================= */
passport.serializeUser((obj, done) => done(null, obj));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
