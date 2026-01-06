import express from "express";
import { sendEventNotification, listMyNotifications } from "../controllers/notificationController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, listMyNotifications);
router.post(
  "/events/:id/send",
  verifyToken,
  authorizeRoles("organisateur", "admin"),
  sendEventNotification
);

export default router;
