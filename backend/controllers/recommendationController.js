import Event from "../models/Event.js";

export const recommendEvents = async (req, res) => {
  try {
    const user = req.user; 
    const filters = {};

    if (user.interests?.length > 0) {
      filters.category = { $in: user.interests };
    }

    if (user.city) {
      filters["location.city"] = user.city;
    }

    const recommended = await Event.find(filters)
      .sort({ date: 1 })
      .limit(6);

    // Fallback if nothing matches
    if (recommended.length === 0) {
      const fallback = await Event.find().sort({ attendees: -1 }).limit(6);
      return res.json({ recommended: fallback });
    }

    res.json({ recommended });
  } catch (err) {
    res.status(500).json({ message: "Erreur recommandation" });
  }
};
