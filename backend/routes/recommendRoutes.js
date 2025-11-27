import express from "express";
import { recommendEvents } from "../controllers/recommendationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, recommendEvents);

export default router;
