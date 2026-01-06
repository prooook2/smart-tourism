// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: {
      city: String,
      coords: {
        lat: Number,
        lng: Number,
      },
    },

    // Legacy flat price kept for compatibility and quick filters
    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Ticketing: multiple ticket types with inventory
    ticketTypes: [
      {
        label: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 0 },
        sold: { type: Number, default: 0, min: 0 },
      },
    ],

    image: {
      type: String,
      default: "",
    },
    category: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    capacity: { type: Number, default: 100, min: 0 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Sync capacity to total ticket quantity when ticket types are provided
eventSchema.pre("save", function syncCapacity(next) {
  if (Array.isArray(this.ticketTypes) && this.ticketTypes.length > 0) {
    const totalQty = this.ticketTypes.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    if (!Number.isNaN(totalQty) && totalQty >= 0) {
      this.capacity = totalQty;
    }
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
