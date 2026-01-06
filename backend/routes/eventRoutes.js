// backend/routes/eventRoutes.js
import express from "express";
import uploadEventImage from "../middleware/eventUpload.js";
import { cacheMiddleware, invalidateCache } from "../middleware/cacheMiddleware.js";

import {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  saveEvent,
  unsaveEvent,
} from "../controllers/eventController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", cacheMiddleware(30000), listEvents); // Cache for 30 seconds
router.get("/:id", cacheMiddleware(60000), getEventById); // Cache for 60 seconds

// Protected routes
router.post(
  "/",
  verifyToken,
  authorizeRoles("organisateur", "admin"),
  uploadEventImage.single("image"),
  createEvent
);
router.put("/:id", verifyToken, authorizeRoles("organisateur", "admin"),  uploadEventImage.single("image"),
 updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("organisateur", "admin"), deleteEvent);
router.post("/:id/register", verifyToken, registerForEvent);
router.post("/:id/cancel", verifyToken, cancelRegistration);
router.post("/:id/save", verifyToken, saveEvent);
router.delete("/:id/save", verifyToken, unsaveEvent);



export default router;
