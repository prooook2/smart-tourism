import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const cities = [
  "Tunis", "Sfax", "sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", 
  "Gafsa", "Monastir", "Ben Arous", "Kasserine", "Médenine", "Nabeul",
  "Tataouine", "Béja", "Jendouba", "Mahdia", "Sidi Bouzid", "Zaghouan",
  "Siliana", "Kébili", "Tozeur", "Manouba", "La Marsa", "Hammamet", "Djerba"
];

const categories = [
  "Culture", "Gastronomie", "Art", "Patrimoine", "Sport", "Music", 
  "Nature", "Festival", "Conférence", "Atelier", "Spectacle", "Exposition"
];

const Profile = () => {
  const [user, setUser] = useState({});
  const [events, setEvents] = useState({
    organized: [],
    registered: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", city: "", interests: [], budgetMin: 0, budgetMax: 0 });
  const [locating, setLocating] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
          setFormData({ name: res.data.name, email: res.data.email, password: "", city: res.data.city || "", interests: res.data.interests || [], budgetMin: res.data.budgetMin ?? 0, budgetMax: res.data.budgetMax ?? 0, coords: res.data.coords || undefined });
      } catch (error) {
        console.error(error);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents({
          organized: res.data.organized || [],
          registered: res.data.registered || [],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchEvents();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const normalize = (s = "") => s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const resolveCityFromAddress = (address) => {
    const candidates = [
      address?.city,
      address?.town,
      address?.village,
      address?.municipality,
      address?.county,
      address?.state_district,
    ].filter(Boolean);
    const normalizedMap = new Map(cities.map((c) => [normalize(c), c]));
    for (const cand of candidates) {
      const key = normalize(cand);
      if (normalizedMap.has(key)) return normalizedMap.get(key);
    }
    // Heuristic match by inclusion
    for (const cand of candidates) {
      const key = normalize(cand);
      for (const c of cities) {
        if (key.includes(normalize(c))) return c;
      }
    }
    return null;
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const resp = await fetch(url, { headers: { Accept: "application/json" } });
          const data = await resp.json();
          const detected = resolveCityFromAddress(data?.address || {});
          if (detected) {
            setFormData((prev) => ({ ...prev, city: detected, coords: { lat: latitude, lng: longitude } }));
            toast.success(`Ville détectée: ${detected}`);
          } else {
            toast("Ville non reconnue, sélectionnez-la dans la liste.");
          }
        } catch (e) {
          toast.error("Échec de la détection de la ville.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Permission de localisation refusée.");
        } else {
          toast.error("Impossible d'obtenir votre position.");
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("http://localhost:5000/api/users/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profil mis à jour !");
      setUser(res.data.user);
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur de mise à jour");
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await axios.put("http://localhost:5000/api/users/me/avatar", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Photo de profil mise à jour !");
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Échec de l'upload");
    }
  };

  const sectionClass = "rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10";

  const eventSections = [
    {
      title: "Mes expériences réservées",
      items: events.registered,
      empty: "Aucune réservation pour le moment. Explorez nos événements pour vous inspirer.",
    },
    {
      title: "Mes événements organisés",
      items: events.organized,
      empty: "Vous n’avez pas encore publié d’expérience.",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="grid gap-8 rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-primary/20 backdrop-blur md:grid-cols-[220px,1fr]">
          <div className="flex flex-col items-center text-center">
            <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-primary/20 bg-pink-50 shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-primary">👤</div>
              )}
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <span>+ Actualiser la photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
            </label>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Profil</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">{user.name}</h1>
            <p className="text-dusk/70">{user.email}</p>
            {user.city && <p className="text-sm text-dusk/60">📍 {user.city}</p>}
            {(user.budgetMin !== undefined || user.budgetMax !== undefined) && (
              <p className="text-sm text-dusk/60">
                💸 Budget: {typeof user.budgetMin === 'number' ? user.budgetMin : 0}
                {typeof user.budgetMax === 'number' && user.budgetMax > 0 ? ` - ${user.budgetMax}` : ' +'} €
              </p>
            )}
              {user.interests?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.interests.map(int => (
                    <span key={int} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {int}
                    </span>
                  ))}
                </div>
              )}
            <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {user.role}
            </p>

            <div className="mt-6 space-y-4">
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <input className={inputClass} name="name" value={formData.name} onChange={handleChange} placeholder="Nom complet" />
                  <input className={inputClass} name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                  <div className="flex items-center gap-3">
                    <select className={`${inputClass} flex-1`} name="city" value={formData.city} onChange={handleChange}>
                      <option value="">Sélectionnez votre ville</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={useMyLocation}
                      disabled={locating}
                      className="whitespace-nowrap rounded-full border border-primary/30 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
                    >
                      {locating ? "Localisation…" : "📍 Ma position"}
                    </button>
                  </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-dusk">Centres d'intérêt</label>
                      <div className="rounded-2xl border border-pink-100 bg-white p-4">
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                const isSelected = formData.interests.includes(cat);
                                setFormData({
                                  ...formData,
                                  interests: isSelected
                                    ? formData.interests.filter(i => i !== cat)
                                    : [...formData.interests, cat]
                                });
                              }}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                formData.interests.includes(cat)
                                  ? "bg-primary text-white shadow-glow"
                                  : "border border-dusk/10 text-dusk hover:border-primary hover:text-primary"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-dusk">Budget préféré</label>
                      <select
                        className={inputClass}
                        value={(formData.budgetMin || 0) + '-' + (formData.budgetMax || '')}
                        onChange={(e) => {
                          const [minStr, maxStr] = e.target.value.split('-');
                          const min = Number(minStr) || 0;
                          const max = maxStr === '' ? undefined : Number(maxStr);
                          setFormData({ ...formData, budgetMin: min, budgetMax: max });
                        }}
                      >
                        <option value={'0-0'}>Gratuit</option>
                        <option value={'0-20'}>0 - 20 €</option>
                        <option value={'20-50'}>20 - 50 €</option>
                        <option value={'50-100'}>50 - 100 €</option>
                        <option value={'100-'}>100 € et +</option>
                      </select>
                    </div>
                  <input
                    className={inputClass}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nouveau mot de passe"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="rounded-full border border-dusk/15 px-6 py-3 text-sm font-semibold text-dusk"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setEditMode(true)}
                    className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                  >
                    Modifier mon profil
                  </button>
                  <LogoutButton />
                </div>
              )}
            </div>
          </div>
        </div>

        {eventSections.map((section) => (
          <div key={section.title} className={sectionClass}>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Agenda</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{section.title}</h2>
              </div>
            </div>

            {section.items.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {section.items.map((ev) => (
                  <li key={ev._id} className="flex items-center justify-between rounded-2xl border border-dusk/10 bg-secondary px-4 py-3 text-sm text-dusk">
                    <div>
                      <p className="font-semibold text-ink">{ev.title}</p>
                      <p className="text-xs text-dusk/60">{new Date(ev.date).toLocaleDateString()} — {ev.location?.city || "À confirmer"}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">#{ev.category || "expérience"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-dusk/60">{section.empty}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Profile;
