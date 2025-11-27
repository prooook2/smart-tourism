import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import bodyParser from "body-parser";


const router = express.Router();



// User must be logged in to pay
router.post("/create-checkout-session", verifyToken, createCheckoutSession);



export default router;
