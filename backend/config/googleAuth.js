import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        // 2️⃣ Create new user if not found
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: "", // no password for Google users
            role: "visiteur",
          });
        }

        // 3️⃣ Generate JWT token including role
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // 4️⃣ Pass both user and token to callback
        return done(null, { ...user.toObject(), token });
      } catch (err) {
        console.error("❌ Google authentication error:", err);
        return done(err, null);
      }
    }
  )
);

// 5️⃣ Serialize / deserialize for Passport (even if session is false)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
