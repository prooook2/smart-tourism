import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    type: {
      type: String,
      enum: ["reminder", "update", "cancellation"],
      default: "update",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "partial", "failed"],
      default: "sent",
    },
    failedRecipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
