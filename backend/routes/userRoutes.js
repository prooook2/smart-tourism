import express from "express";
import { getUserProfile, updateUserProfile, updateProfileAvatar, getMyEvents, getOrganizerMetrics } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";


const router = express.Router();

router.get("/me", verifyToken, getUserProfile);

router.put("/me", verifyToken, updateUserProfile);
router.get("/my-events", verifyToken, getMyEvents);

router.get("/metrics/organizer", verifyToken, authorizeRoles("organisateur"), getOrganizerMetrics);

router.put("/me/avatar", verifyToken, upload.single("avatar"), updateProfileAvatar);


export default router;
