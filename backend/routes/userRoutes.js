import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current user's profile
router.get("/me", verifyToken, getUserProfile);

// Update current user's profile
router.put("/me", verifyToken, updateUserProfile);

export default router;
