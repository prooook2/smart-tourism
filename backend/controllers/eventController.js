// backend/controllers/eventController.js
import Event from "../models/Event.js";
import User from "../models/User.js";

// Create event (organiser or admin)
export const createEvent = async (req, res) => {
  try {
    let data = req.body;

    // Parse location JSON
    // Fix location coming from FormData
    if (data.location) {
      try {
        data.location = JSON.parse(data.location);
      } catch (err) {
        console.error("Location JSON parse error:", err);
        data.location = { city: "" };
      }
    } else {
      data.location = { city: "" };
    }



    // Set organiser to logged user
    data.organizer = req.user.id;

    // Save image if uploaded
    if (req.file) {
  data.image = req.file.path;  // Cloudinary returns uploaded URL here
}


    const event = await Event.create(data);

    res.status(201).json({ event });
  } catch (err) {
    console.error("CreateEvent error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


// List events (with simple filters & pagination)
export const listEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, category, city, upcoming } = req.query;
    const filters = {};
    if (q) filters.$or = [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
    if (category) filters.category = category;
    if (city) filters["location.city"] = city;
    if (upcoming === "true") filters.date = { $gte: new Date() };

    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(filters);
    const events = await Event.find(filters)
      .populate("organizer", "name email role")
      .sort({ date: 1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("ListEvents error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get single event
export { getEventById as getEvent };

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");

    if (!event) return res.status(404).json({ message: "Événement introuvable" });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update event (only organiser or admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    // only organiser or admin
    if (req.user.role !== "admin" && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier cet événement" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ event });
  } catch (err) {
    console.error("UpdateEvent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Delete event
// controllers/eventController.js
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // Optional: check if user is owner/admin
    if (req.user.role !== "admin" && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await Event.findByIdAndDelete(req.params.id); // ✅ instead of event.remove()

    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error("DeleteEvent error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🟢 Register for event
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    // Check if already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: "Déjà inscrit à cet événement" });
    }

    // Check capacity
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: "Capacité maximale atteinte" });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ message: "Inscription réussie", event });
  } catch (err) {
    console.error("registerForEvent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔴 Cancel registration
export const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: "Non inscrit à cet événement" });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user.id
    );
    await event.save();

    res.json({ message: "Désinscription réussie", event });
  } catch (err) {
    console.error("cancelRegistration error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const saveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (event.savedBy.includes(req.user.id)) {
      return res.status(400).json({ message: "Déjà enregistré" });
    }

    event.savedBy.push(req.user.id);
    await event.save();

    res.json({ message: "Événement enregistré", event });
  } catch (err) {
    console.error("saveEvent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const unsaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    event.savedBy = event.savedBy.filter(
      (id) => id.toString() !== req.user.id
    );

    await event.save();
    res.json({ message: "Événement retiré de vos favoris", event });
  } catch (err) {
    console.error("unsaveEvent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};









