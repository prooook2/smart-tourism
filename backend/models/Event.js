// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
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
  price: {
  type: Number,
  default: 0
},
  image: {
  type: String,
  default: "",
},
  category: { type: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  capacity: { type: Number, default: 100 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
