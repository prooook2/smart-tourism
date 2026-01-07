import express from "express";
import { createCheckoutSession, confirmCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import bodyParser from "body-parser";


const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

router.post("/confirm", verifyToken, confirmCheckoutSession);



export default router;
