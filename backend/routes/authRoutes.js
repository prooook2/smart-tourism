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

// 🔹 Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔹 Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Redirect user to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // redirect back to frontend with token
    res.redirect(`http://localhost:3000/google-success?token=${token}`);
  }
);

export default router;
