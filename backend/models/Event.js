import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true }, // HH:MM format, optional
    duration: { type: Number, default: 90, min: 0 }, // Duration in minutes
    location: {
      city: String,
      coords: {
        lat: Number,
        lng: Number,
      },
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    ticketTypes: [
      {
        label: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 0 },
        sold: { type: Number, default: 0, min: 0 },
      },
    ],

    minPrice: { type: Number, default: 0, min: 0 },

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

eventSchema.pre("save", function syncCapacity(next) {
  if (Array.isArray(this.ticketTypes) && this.ticketTypes.length > 0) {
    const totalQty = this.ticketTypes.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    if (!Number.isNaN(totalQty) && totalQty >= 0) {
      this.capacity = totalQty;
    }
  }
  next();
});

eventSchema.pre("save", function computeMinPrice(next) {
  if (Array.isArray(this.ticketTypes) && this.ticketTypes.length > 0) {
    const min = this.ticketTypes
      .map((t) => Number(t.price))
      .filter((p) => !Number.isNaN(p) && p >= 0)
      .reduce((acc, p) => (acc === null ? p : Math.min(acc, p)), null);
    if (min !== null) this.minPrice = min;
  } else if (typeof this.price === "number" && this.price >= 0) {
    this.minPrice = this.price;
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
