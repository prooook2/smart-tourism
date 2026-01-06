// backend/controllers/eventController.js
import Event from "../models/Event.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import sendEmail from "../Utils/sendEmail.js";
import { invalidateCache } from "../middleware/cacheMiddleware.js";


// Create event (organiser or admin)
export const createEvent = async (req, res) => {
  try {
    let data = req.body;

    // Parse location JSON
    // Fix location coming from FormData
   if (data.location) {
      try {
        data.location = JSON.parse(data.location);
        data.location.coords = data.location.coords || { lat: 0, lng: 0 };
      } catch (err) {
        console.error("Location JSON parse error:", err);
        data.location = { city: "", coords: { lat: 0, lng: 0 } };
      }
    } else {
      data.location = { city: "", coords: { lat: 0, lng: 0 } };
    }

    if (data.coords) {
        try {
          data.location.coords = JSON.parse(data.coords);
        } catch (e) {
          data.location.coords = [];
        }
      }

    // Parse ticketing options (FormData string or array)
    if (data.ticketTypes) {
      try {
        const parsed = Array.isArray(data.ticketTypes) ? data.ticketTypes : JSON.parse(data.ticketTypes);
        data.ticketTypes = parsed
          .filter((t) => t && t.label)
          .map((t) => ({
            label: t.label,
            description: t.description || "",
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
            sold: Number(t.sold) || 0,
          }));

        if (data.ticketTypes.length) {
          const minPrice = data.ticketTypes.reduce(
            (min, t) => (t.price < min ? t.price : min),
            Number.POSITIVE_INFINITY
          );
          data.price = Number.isFinite(minPrice) ? minPrice : 0;
        }
      } catch (err) {
        console.error("TicketTypes JSON parse error:", err);
        data.ticketTypes = [];
      }
    }

    // Set organiser to logged user
    data.organizer = req.user.id;
    data.price = Number(data.price || 0);

    // Save image if uploaded
    if (req.file) {
  data.image = req.file.path;  // Cloudinary returns uploaded URL here
}

    const event = await Event.create(data);
    
    // Invalidate cache when new event is created
    invalidateCache("/api/events");

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

    const trimmedQ = q?.trim();

    // Text search across multiple fields
    if (trimmedQ) {
      const regex = new RegExp(trimmedQ, "i");
      filters.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { "location.city": regex },
      ];
    }

    if (category) filters.category = category;
    if (city) filters["location.city"] = city;

    // Price range filters
    let priceFilter = null;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    if (minPrice !== null && !Number.isNaN(minPrice)) {
      priceFilter = { ...priceFilter, $gte: minPrice };
    }
    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      priceFilter = { ...priceFilter, $lte: maxPrice };
    }

    if (priceFilter) filters.price = priceFilter;

    if (upcoming === "true") filters.date = { $gte: new Date() };

    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(filters);
    let events = await Event.find(filters)
      .populate("organizer", "name email role")
      .populate("attendees", "_id name email")
      .sort({ date: 1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Attach average rating to each event
    events = await Promise.all(
      events.map(async (e) => {
        const reviews = await Review.find({ event: e._id });
        const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        return { ...e.toObject(), avgRating };
      })
    );

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
    if (req.user.role !== "admin" && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à modifier cet événement" });
    }

    let data = req.body;

    // Parse structured fields
    if (data.location) {
      try {
        data.location = JSON.parse(data.location);
      } catch (e) {
        data.location = event.location; // fallback
      }
    }

    // Ticket types update (accept JSON string or array)
    if (data.ticketTypes) {
      try {
        const parsed = Array.isArray(data.ticketTypes) ? data.ticketTypes : JSON.parse(data.ticketTypes);
        data.ticketTypes = parsed
          .filter((t) => t && t.label)
          .map((t) => ({
            _id: t._id,
            label: t.label,
            description: t.description || "",
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
            sold: Number(t.sold) || 0,
          }));

        if (data.ticketTypes.length) {
          const minPrice = data.ticketTypes.reduce(
            (min, t) => (t.price < min ? t.price : min),
            Number.POSITIVE_INFINITY
          );
          data.price = Number.isFinite(minPrice) ? minPrice : 0;
        }
      } catch (err) {
        console.error("TicketTypes parse error (update):", err);
        data.ticketTypes = event.ticketTypes;
      }
    }

    if (data.price !== undefined) {
      data.price = Number(data.price) || 0;
    }

    // If image uploaded
    if (req.file) {
      data.image = req.file.path;
    }

    Object.assign(event, data);
    await event.save();

    // Invalidate cache after update
    invalidateCache("/api/events");

    res.json({ message: "Événement mis à jour", event });
  } catch (err) {
    console.error("UpdateEvent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Delete event
// controllers/eventController.js
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("attendees", "email name");

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    // Permission check
    if (req.user.role !== "admin" && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Send email to all attendees
    for (const attendee of event.attendees) {
      if (!attendee.email) continue;

      try {
        await sendEmail(
          attendee.email,
          "Événement annulé",
          `<p>Bonjour,</p>
           <p>L'événement <strong>${event.title}</strong> auquel vous étiez inscrit a été <span style="color:red">annulé</span>.</p>
           <p>Cordialement,<br/>Smart Tourism.</p>`
        );
      } catch (err) {
        console.error("Email failed for:", attendee.email);
      }
    }

    await Event.findByIdAndDelete(event._id);

    // Invalidate cache after delete
    invalidateCache("/api/events");

    res.json({ message: "Événement supprimé et participants notifiés" });

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

    const { ticketTypeId } = req.body || {};

    // Ticketed events: only free ticket types can be registered directly (paid go through checkout)
    if (event.ticketTypes?.length) {
      if (!ticketTypeId) {
        return res.status(400).json({ message: "Choisissez un type de billet" });
      }

      const ticketType = event.ticketTypes.id(ticketTypeId);
      if (!ticketType) {
        return res.status(404).json({ message: "Type de billet introuvable" });
      }

      if (ticketType.price > 0) {
        return res.status(400).json({ message: "Billet payant – utilisez le paiement" });
      }

      const remaining = (ticketType.quantity || 0) - (ticketType.sold || 0);
      if (remaining <= 0) {
        return res.status(400).json({ message: "Ce type de billet est épuisé" });
      }

      ticketType.sold = (ticketType.sold || 0) + 1;
    }

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

    const { ticketTypeId } = req.body || {};

    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: "Non inscrit à cet événement" });
    }

    // Free up stock when ticket types exist
    if (event.ticketTypes?.length) {
      let ticketType = ticketTypeId ? event.ticketTypes.id(ticketTypeId) : null;
      if (!ticketType) {
        ticketType = event.ticketTypes.find((t) => t.sold > 0);
      }
      if (ticketType && ticketType.sold > 0) {
        ticketType.sold -= 1;
      }
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









