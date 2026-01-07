import Event from "../models/Event.js";

// Haversine distance helper
const toRad = (v) => (v * Math.PI) / 180;
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

    // Apply budget preferences - simpler approach
    if (typeof user.budgetMax === "number" && user.budgetMax > 0) {
      // Filter by price OR minPrice being within budget
      filters.$or = [
        { price: { $lte: user.budgetMax } },
        { minPrice: { $lte: user.budgetMax } }
      ];
    }

    const initial = await Event.find(filters)
      .sort({ date: 1 })
      .limit(100);

    // If user has coords, compute distance to each event and sort by proximity
    let recommended = initial;
    if (user?.coords && typeof user.coords.lat === 'number' && typeof user.coords.lng === 'number') {
      recommended = initial
        .map((e) => {
          const c = e?.location?.coords;
          let lat, lng;
          if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
            lat = c.lat; lng = c.lng;
          } else if (Array.isArray(c) && c.length >= 2) {
            lat = Number(c[0]); lng = Number(c[1]);
          }
          const distance = lat != null && lng != null ? haversine(user.coords.lat, user.coords.lng, lat, lng) : null;
          return { ...e.toObject(), distance };
        })
        .sort((a, b) => {
          if (a.distance == null && b.distance == null) return 0;
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        })
        .slice(0, 6);
    } else {
      recommended = initial.slice(0, 6);
    }

    // Fallback if nothing matches: relax filters (remove city and interests)
    if (recommended.length === 0) {
      const relaxedFilters = {};
      // Keep budget filter only
      if (filters.$or) relaxedFilters.$or = filters.$or;

      const fbInitial = await Event.find(relaxedFilters)
        .sort({ attendees: -1 })
        .limit(100);
      let fallback = fbInitial;
      if (user?.coords && typeof user.coords.lat === 'number' && typeof user.coords.lng === 'number') {
        fallback = fbInitial
          .map((e) => {
            const c = e?.location?.coords;
            let lat, lng;
            if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
              lat = c.lat; lng = c.lng;
            } else if (Array.isArray(c) && c.length >= 2) {
              lat = Number(c[0]); lng = Number(c[1]);
            }
            const distance = lat != null && lng != null ? haversine(user.coords.lat, user.coords.lng, lat, lng) : null;
            return { ...e.toObject(), distance };
          })
          .sort((a, b) => {
            if (a.distance == null && b.distance == null) return 0;
            if (a.distance == null) return 1;
            if (b.distance == null) return -1;
            return a.distance - b.distance;
          })
          .slice(0, 6);
      } else {
        fallback = fbInitial.slice(0, 6);
      }
      return res.json({ recommended: fallback });
    }

    res.json({ recommended });
  } catch (err) {
    res.status(500).json({ message: "Erreur recommandation" });
  }
};
