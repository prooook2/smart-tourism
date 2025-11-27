import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const Profile = () => {
  const [user, setUser] = useState({});
  const [events, setEvents] = useState({
    organized: [],
    registered: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({ name: res.data.name, email: res.data.email, password: "" });
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
            <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {user.role}
            </p>

            <div className="mt-6 space-y-4">
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <input className={inputClass} name="name" value={formData.name} onChange={handleChange} placeholder="Nom complet" />
                  <input className={inputClass} name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
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
