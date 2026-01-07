import Event from "../models/Event.js";

const haversineKm = (a, b) => {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return Infinity;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const SPEEDS_KM_PER_MIN = {
  walking: 4.5 / 60,
  driving: 25 / 60,
};

export const planItinerary = async (req, res) => {
  try {
    const user = req.user; // from verifyToken

    const {
      start,
      startAt,
      availableMinutes = 240,
      mode = "walking",
      maxStops = 6,
      defaultEventDurationMinutes = 90,
      categories,
      city,
      cityOnly = true,
      useInterests = false,
      includeUnpublished = false,
      strictFilters = true,
    } = req.body || {};

    const startCoords = start?.lat != null && start?.lng != null ? start : (user?.coords?.lat != null ? user.coords : null);
    if (!startCoords) {
      return res.status(400).json({ message: "Start location required: provide {start:{lat,lng}} or set profile coords." });
    }

    const speed = SPEEDS_KM_PER_MIN[mode] || SPEEDS_KM_PER_MIN.walking;
    const chosenCategories = Array.isArray(categories) && categories.length
      ? categories
      : (useInterests && Array.isArray(user?.interests) ? user.interests : []);

    const filters = includeUnpublished ? {} : { isPublished: true };
    const cityFilter = (cityOnly && (city || user?.city)) || city ? (city || user?.city) : null;
    if (cityFilter) {
      filters["location.city"] = cityFilter;
    }
    if (chosenCategories.length) {
      filters.category = { $in: chosenCategories };
    }
    if (startAt) {
      const d = new Date(startAt);
      if (!isNaN(d)) {
        const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
        filters.date = { $gte: dayStart, $lte: dayEnd };
      }
    }

    console.log("[Itinerary] Filters:", JSON.stringify(filters));
    const [candidates, allWithCoords] = await Promise.all([
      Event.find(filters)
        .select("title description date time duration location price minPrice category")
        .lean(),
      Event.find({ ...(includeUnpublished ? {} : { isPublished: true }), "location.coords.lat": { $ne: null }, "location.coords.lng": { $ne: null } })
        .select("_id")
        .lean(),
    ]);
    console.log(`[Itinerary] Found ${candidates.length} candidates matching filters`);

    // Only keep events with coordinates
    const withCoords = candidates.filter(e => e?.location?.coords?.lat != null && e?.location?.coords?.lng != null);
    console.log(`[Itinerary] ${withCoords.length} events have coordinates`);

    // Pre-compute distances from start for diagnostics and fallback
    const withDistances = withCoords.map(e => {
      const dkm = haversineKm(startCoords, e.location.coords);
      const tmin = Math.ceil(dkm / speed);
      const evDur = e.duration || defaultEventDurationMinutes;
      return { e, distanceKm: dkm, travelMin: tmin, durationMin: evDur, blockMin: tmin + evDur };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const endTimeMinutes = availableMinutes;
    let elapsed = 0;
    let current = { ...startCoords };
    const picked = [];
    let stoppedDueToTime = false;

    const fillWith = (pool) => {
      let remainingPool = [...pool];
      while (picked.length < maxStops && remainingPool.length > 0) {
        remainingPool.sort((a, b) => {
          const da = haversineKm(current, a.location.coords);
          const db = haversineKm(current, b.location.coords);
          if (da !== db) return da - db;
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return ta - tb;
        });

        const next = remainingPool.shift();
        const distanceKm = haversineKm(current, next.location.coords);
        const travelMin = Math.ceil(distanceKm / speed);
        const eventDuration = next.duration || defaultEventDurationMinutes;
        const blockMin = travelMin + eventDuration;

        if (elapsed + blockMin > endTimeMinutes) {
          stoppedDueToTime = true;
          break;
        }

        picked.push({ event: next, distanceKm, travelMin, durationMin: eventDuration, arriveAtMin: elapsed + travelMin, departAtMin: elapsed + blockMin });
        elapsed += blockMin;
        current = next.location.coords;
      }
    };

    fillWith(withCoords);

    // Fallback 1: relax city (only if not strict)
    if (!strictFilters && picked.length < maxStops && cityFilter) {
      const relaxedFilters = { ...filters };
      delete relaxedFilters["location.city"];
      console.log(`[Itinerary] Fallback: relaxing city filter (had ${picked.length}/${maxStops})`);
      const extraCandidates = await Event.find(relaxedFilters)
        .select("title description date time duration location price minPrice category")
        .lean();
      const extraWithCoords = extraCandidates
        .filter(e => e?.location?.coords?.lat != null && e?.location?.coords?.lng != null)
        .filter(e => !picked.some(p => String(p.event._id) === String(e._id)));
      fillWith(extraWithCoords);
    }

    // Fallback 2: relax categories (only if not strict)
    if (!strictFilters && picked.length < maxStops && chosenCategories.length) {
      const relaxedFilters = { ...filters };
      delete relaxedFilters["location.city"];
      delete relaxedFilters.category;
      console.log(`[Itinerary] Fallback: relaxing categories (had ${picked.length}/${maxStops})`);
      const extraCandidates = await Event.find(relaxedFilters)
        .select("title description date time duration location price minPrice category")
        .lean();
      const extraWithCoords = extraCandidates
        .filter(e => e?.location?.coords?.lat != null && e?.location?.coords?.lng != null)
        .filter(e => !picked.some(p => String(p.event._id) === String(e._id)));
      fillWith(extraWithCoords);
    }

    // Fallback 3 removed (budget)

    let suggestions = [];
    if (picked.length === 0 && withDistances.length > 0) {
      // Provide up to 3 nearest suggestions with travel and block estimates
      suggestions = withDistances.slice(0, 3).map(x => ({
        eventId: x.e._id,
        title: x.e.title,
        city: x.e.location?.city || null,
        category: x.e.category || null,
        date: x.e.date || null,
        time: x.e.time || null,
        duration: x.durationMin,
        distanceFromStartKm: Number(x.distanceKm.toFixed(2)),
        travelFromStartMinutes: x.travelMin,
        estimatedBlockMinutes: x.blockMin,
      }));
    }

    return res.json({
      paramsUsed: {
        start: startCoords,
        startAt: startAt || null,
        availableMinutes,
        mode,
        maxStops,
        defaultEventDurationMinutes,
        categories: chosenCategories,
        city: filters["location.city"] || null,
        cityOnly,
        includeUnpublished,
        strictFilters,
      },
      debug: {
        totalCandidates: candidates.length,
        withCoords: withCoords.length,
        filtersApplied: filters,
        allEventsWithCoords: allWithCoords.length,
        stoppedDueToTime,
        elapsedMinutes: elapsed,
        endTimeMinutes,
      },
      results: {
        count: picked.length,
        totalMinutesUsed: elapsed,
        remainingMinutes: Math.max(0, endTimeMinutes - elapsed),
      },
      suggestions,
      steps: picked.map((p) => ({
        eventId: p.event._id,
        title: p.event.title,
        city: p.event.location?.city || null,
        category: p.event.category || null,
        date: p.event.date || null,
        time: p.event.time || null,
        duration: p.durationMin,
        price: p.event.price ?? null,
        minPrice: p.event.minPrice ?? null,
        distanceFromPrevKm: Number(p.distanceKm.toFixed(2)),
        travelFromPrevMinutes: p.travelMin,
        arriveAtMinutes: p.arriveAtMin,
        departAtMinutes: p.departAtMin,
        coords: p.event.location.coords,
      })),
    });
  } catch (err) {
    console.error("planItinerary error:", err);
    return res.status(500).json({ message: "Failed to plan itinerary" });
  }
};

export default { planItinerary };
