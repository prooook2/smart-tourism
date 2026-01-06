import express from "express";
import {
  getEventReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/event/:eventId", getEventReviews);
router.post("/event/:eventId", verifyToken, createReview);
router.put("/:reviewId", verifyToken, updateReview);
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;
