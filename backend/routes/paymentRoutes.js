import express from "express";
import { createCheckoutSession, confirmCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import bodyParser from "body-parser";


const router = express.Router();



// User must be logged in to pay
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// Fallback confirmation (useful when Stripe webhook can't reach dev machine)
router.post("/confirm", verifyToken, confirmCheckoutSession);



export default router;
