import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { planItinerary } from "../controllers/itineraryController.js";

const router = Router();

router.post("/plan", verifyToken, planItinerary);

export default router;
