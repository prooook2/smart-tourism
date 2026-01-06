import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import sendEmail from "../Utils/sendEmail.js";

const TYPE_LABELS = {
  reminder: "Rappel",
  update: "Mise à jour",
  cancellation: "Annulation",
};

// Send a notification email to attendees (and optionally saved users) of an event
export const sendEventNotification = async (req, res) => {
  try {
    const { type = "update", message, title, includeSaved = false } = req.body || {};

    const normalizedType = TYPE_LABELS[type] ? type : "update";
    const content = typeof message === "string" ? message.trim() : "";
    if (!content) {
      return res.status(400).json({ message: "Le message de notification est requis" });
    }

    const event = await Event.findById(req.params.id)
      .populate("attendees", "name email")
      .populate("savedBy", "name email")
      .populate("organizer", "name");

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // Only the event organiser or an admin can notify
    if (req.user.role !== "admin" && event.organizer?._id?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Vous ne pouvez notifier que vos propres événements" });
    }

    const rawRecipients = includeSaved
      ? [...event.attendees, ...event.savedBy]
      : [...event.attendees];

    const recipients = [];
    const seen = new Set();
    for (const user of rawRecipients) {
      if (!user?._id) continue;
      const id = user._id.toString();
      if (seen.has(id)) continue;
      seen.add(id);
      recipients.push(user);
    }

    if (!recipients.length) {
      return res.status(400).json({ message: "Aucun participant à notifier" });
    }

    const subject = (title && title.trim()) || `${TYPE_LABELS[normalizedType]} - ${event.title}`;
    const eventCity = event.location?.city || "Lieu à confirmer";
    const eventDate = event.date ? new Date(event.date).toLocaleString() : "Date à confirmer";

    const htmlBody = `
      <p>Bonjour,</p>
      <p>${content}</p>
      <p><strong>Événement :</strong> ${event.title}<br/>
      <strong>Date :</strong> ${eventDate}<br/>
      <strong>Lieu :</strong> ${eventCity}</p>
      <p>Cordialement,<br/>Smart Tourism</p>
    `;

    let sentCount = 0;
    const failed = [];

    await Promise.all(
      recipients.map(async (user) => {
        if (!user.email) {
          failed.push(user._id);
          return;
        }
        try {
          await sendEmail(user.email, subject, htmlBody);
          sentCount += 1;
        } catch (err) {
          console.error("Notification email failed:", err?.message || err);
          failed.push(user._id);
        }
      })
    );

    const status = failed.length === 0 ? "sent" : sentCount ? "partial" : "failed";

    await Notification.create({
      event: event._id,
      sender: req.user.id,
      recipients: recipients.map((u) => u._id),
      type: normalizedType,
      title: subject,
      message: content,
      status,
      failedRecipients: failed,
    });

    res.json({
      message: "Notifications traitées",
      sent: sentCount,
      failed: failed.length,
      total: recipients.length,
    });
  } catch (err) {
    console.error("sendEventNotification error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// List notifications for the authenticated user (basic feed)
export const listMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const notifications = await Notification.find({ recipients: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("event", "title date")
      .populate("sender", "name email");

    res.json({ notifications });
  } catch (err) {
    console.error("listMyNotifications error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
