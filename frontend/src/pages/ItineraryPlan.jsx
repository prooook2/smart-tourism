import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ItineraryPlan = () => {
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    availableMinutes: 240,
    mode: "walking",
    maxStops: 5,
    defaultEventDurationMinutes: 60,
    cityOnly: true,
    city: "",
    categories: [],
    start: null,
    strictFilters: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({ ...prev, start: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
      },
      (err) => setError("Impossible de récupérer la position: " + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const body = {
        availableMinutes: Number(form.availableMinutes) || 240,
        mode: form.mode,
        maxStops: Number(form.maxStops) || 5,
        defaultEventDurationMinutes: Number(form.defaultEventDurationMinutes) || 60,
        cityOnly: !!form.cityOnly,
        city: form.city?.trim() || undefined,
        categories: form.categories?.length ? form.categories : undefined,
        start: form.start || undefined,
        strictFilters: !!form.strictFilters,
      };

      const { data } = await axios.post("http://localhost:5000/api/itinerary/plan", body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const categories = exists ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat];
      return { ...prev, categories };
    });
  };

  const minutesToTime = (offsetMin) => {
    return `${offsetMin} min`;
  };

  const timeFromDate = (iso) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return null;
    }
  };

  const CATEGORY_OPTIONS = [
    "Culture", "Gastronomie", "Art", "Patrimoine", "Sport", "Music",
    "Nature", "Festival", "Conférence", "Atelier", "Spectacle", "Exposition"
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-bold text-ink">{t("itinerary.title")}</h1>
      <p className="text-dusk mt-1">
        {t("itinerary.subtitle")}
      </p>

      <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dusk/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{t("itinerary.parameters")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs text-dusk">{t("itinerary.availableTime")}
              <input name="availableMinutes" value={form.availableMinutes} onChange={handleChange} type="number" min="30" className="mt-1 w-full rounded-lg border border-dusk/20 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-dusk">{t("itinerary.mode")}
              <select name="mode" value={form.mode} onChange={handleChange} className="mt-1 w-full rounded-lg border border-dusk/20 px-3 py-2 text-sm">
                <option value="walking">{t("itinerary.walking")}</option>
                <option value="driving">{t("itinerary.driving")}</option>
              </select>
            </label>
            <label className="text-xs text-dusk">{t("itinerary.maxStops")}
              <input name="maxStops" value={form.maxStops} onChange={handleChange} type="number" min="1" className="mt-1 w-full rounded-lg border border-dusk/20 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-dusk">{t("itinerary.duration")}
              <input name="defaultEventDurationMinutes" value={form.defaultEventDurationMinutes} onChange={handleChange} type="number" min="15" className="mt-1 w-full rounded-lg border border-dusk/20 px-3 py-2 text-sm" />
            </label>
            {/* <label className="col-span-2 flex items-center gap-2 text-xs text-dusk">
             <input type="checkbox" name="cityOnly" checked={form.cityOnly} onChange={handleChange} />
              Restreindre à ma ville
            </label> */}
            <label className="col-span-2 flex items-center gap-2 text-xs text-dusk">
              <input type="checkbox" name="strictFilters" checked={form.strictFilters} onChange={handleChange} />
              {t("itinerary.strictFilters")}
            </label>
            <label className="text-xs text-dusk">{t("itinerary.city")}
              <input name="city" value={form.city} onChange={handleChange} type="text" placeholder={user?.city || "Tunis"} className="mt-1 w-full rounded-lg border border-dusk/20 px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={useMyLocation} className="rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/10">
              {t("itinerary.useMyLocation")}
            </button>
            {form.start && (
              <span className="text-xs text-dusk">Start: {form.start.lat.toFixed(4)}, {form.start.lng.toFixed(4)}</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-dusk/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{t("itinerary.categories")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs border ${form.categories.includes(cat) ? "bg-primary text-white border-primary" : "border-dusk/20 text-dusk hover:border-primary/40"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          <button type="submit" disabled={loading} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
            {loading ? t("itinerary.calculating") : t("itinerary.plan")}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-dusk/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{t("itinerary.itineraryResult")}</h2>
          <p className="text-xs text-dusk mt-1">{t("itinerary.stops")} {result.results?.count} • {t("itinerary.timeUsed")} {result.results?.totalMinutesUsed} min • {t("itinerary.remaining")} {result.results?.remainingMinutes} min</p>
          {result.paramsUsed?.mode && (
            <p className="text-[11px] text-dusk/70 mt-1">Mode: {result.paramsUsed.mode === "walking" ? t("itinerary.walking") : t("itinerary.driving")}</p>
          )}

          {result.debug && (
            <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2 text-xs">
              <p className="font-semibold text-yellow-800">Debug:</p>
              <p className="text-yellow-700">Candidats trouvés: {result.debug.totalCandidates} • Avec coords: {result.debug.withCoords}</p>
              <p className="text-yellow-700">Ville filtrée: {result.paramsUsed?.city || "Aucune"}</p>
              <p className="text-yellow-700">Catégories: {result.paramsUsed?.categories?.join(", ") || "Aucune"}</p>
              <p className="text-yellow-700">Filtres stricts: {result.paramsUsed?.strictFilters ? "Oui" : "Non (peut relaxer)"}</p>
            </div>
          )}

          {result.results?.count === 0 && (
            <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
              <p className="font-semibold">{t("itinerary.noResults")}</p>
              {result.suggestions?.length > 0 && (
                <div className="mt-2 text-orange-900">
                  <p className="font-semibold">{t("itinerary.suggestions")}</p>
                  <ul className="mt-1 ml-4 list-disc">
                    {result.suggestions.map(s => (
                      <li key={s.eventId}>
                        {s.title} — {s.city || "?"} • {s.category || "Divers"} • {s.distanceFromStartKm} km, trajet {s.travelFromStartMinutes} min, bloc estimé {s.estimatedBlockMinutes} min
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-2">
                {t("itinerary.tryTips")}
                <ul className="mt-1 ml-4 list-disc">
                  <li>{t("itinerary.tip1")}</li>
                  <li>{t("itinerary.tip2")}</li>
                  <li>{t("itinerary.tip3")}</li>
                </ul>
              </div>
            </div>
          )}

          <ol className="mt-3 space-y-3">
            {result.steps?.map((s, idx) => (
              <li key={s.eventId} className="rounded-lg border border-dusk/10 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{idx + 1}. {s.title}</p>
                    <p className="text-xs text-dusk">{s.city} • {s.category || "Divers"}</p>
                    {(timeFromDate(s.date) || s.time) && (
                      <p className="text-xs text-primary mt-1">🕐 Événement à {timeFromDate(s.date) || s.time} {s.duration ? `(${s.duration} min)` : ""}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dusk">↦ {s.distanceFromPrevKm} km ({s.travelFromPrevMinutes} min)</p>
                    <p className="text-xs text-dusk">Arrivée {minutesToTime(s.arriveAtMinutes)} • Départ {minutesToTime(s.departAtMinutes)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlan;
