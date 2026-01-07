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
import { stripeWebhook } from "./controllers/paymentController.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";



dotenv.config();

const app = express();



// 🔥 Stripe webhook MUST come BEFORE express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);


// JSON body parser (AFTER webhook)
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use(passport.initialize());
app.use("/api/payments", paymentRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);


// Basic test route
app.get("/", (req, res) => {
  res.send("Smart Cultural & Tourism Platform API is running...");
});

// MongoDB
const mongoUri = process.env.MONGO_URI || "";
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB error:", err));
} else {
  console.warn("⚠️ MONGO_URI not set. Server starting without DB connection.");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
