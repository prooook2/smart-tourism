import express from "express";
import { getUserProfile, updateUserProfile, updateProfileAvatar } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { getMyEvents } from "../controllers/userController.js";


const router = express.Router();

// Get current user's profile
router.get("/me", verifyToken, getUserProfile);

// Update current user's profile
router.put("/me", verifyToken, updateUserProfile);
router.get("/my-events", verifyToken, getMyEvents);


router.put("/me/avatar", verifyToken, upload.single("avatar"), updateProfileAvatar);


export default router;
