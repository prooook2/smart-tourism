import express from "express";
import passport from "passport";
import "../config/googleAuth.js";
import jwt from "jsonwebtoken";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// 🔹 Email/password authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔹 Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔹 Start Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔹 Handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:3000/login" }),
  async (req, res) => {
    try {
      // Create token that includes role
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Serialize user info to send to frontend
      const user = JSON.stringify(req.user);

      // Redirect back to frontend login page with token and user info
      res.redirect(
        `http://localhost:3000/login?token=${token}&user=${encodeURIComponent(user)}`
      );
    } catch (error) {
      console.error("❌ Google Auth Error:", error);
      res.redirect("http://localhost:3000/login?error=GoogleAuthFailed");
    }
  }
);

export default router;
