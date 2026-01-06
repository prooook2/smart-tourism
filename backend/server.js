import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import passport from "passport";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/paymentController.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import { generalLimiter, authLimiter, paymentLimiter, createEventLimiter } from "./middleware/rateLimiter.js";



dotenv.config();

const app = express();



// 🔥 Stripe webhook MUST come BEFORE express.json()
app.post("/api/payments/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhook);


// JSON body parser (AFTER webhook)
app.use(express.json());
app.use(cors());

// Routes with specific rate limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", generalLimiter, userRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);
app.use("/api/events", generalLimiter, eventRoutes);
app.use(passport.initialize());
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/recommend", generalLimiter, recommendRoutes);
app.use("/api/reviews", generalLimiter, reviewRoutes);
app.use("/api/notifications", generalLimiter, notificationRoutes);


// Basic test route
app.get("/", (req, res) => {
  res.send("Smart Cultural & Tourism Platform API is running...");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
