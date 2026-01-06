import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  paymentId: { type: String, required: true }, // Stripe payment intent or session ID
  qrCode: { type: String, required: true }, // base64 or cloudinary URL
  ticketTypeId: { type: String }, // _id of ticket type subdoc
  ticketTypeLabel: { type: String },
  pricePaid: { type: Number },
  status: {
    type: String,
    enum: ["valid", "used", "cancelled"],
    default: "valid",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);
