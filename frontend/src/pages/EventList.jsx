import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("http://localhost:5000/api/events?upcoming=true");
        setEvents(res.data.events || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des événements");
      }
    }
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Événement supprimé avec succès !");
      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff0f6] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-2xl shadow-primary/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Programmation</p>
          <h1 className="mt-4 text-4xl font-bold text-ink">Événements à venir</h1>
          <p className="mt-3 text-dusk/70">
            Une sélection raffinée d’expériences culturelles et touristiques créées par la communauté Smart Tourism.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(user?.role === "organisateur" || user?.role === "admin") && (
              <Link
                to="/events/create"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                ➕ Publier un événement
              </Link>
            )}
            <Link
              to="/"
              className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((e) => (
              <article
                key={e._id}
                className="flex h-full flex-col rounded-3xl border border-pink-50 bg-white/95 shadow-lg shadow-primary/10 transition hover:-translate-y-1"
              >
                {e.image && (
                  <img src={e.image} alt={e.title} className="h-48 w-full rounded-t-3xl object-cover" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    {new Date(e.date).toLocaleDateString()} · {e.location?.city || "À confirmer"}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-ink">{e.title}</h3>
                  <p className="mt-3 flex-1 text-sm text-dusk/70">
                    {e.description?.slice(0, 140) || "Découvrez une expérience immersive sélectionnée par nos curateurs."}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                    <Link to={`/events/${e._id}`} className="text-primary hover:underline">
                      Voir les détails →
                    </Link>
                    {(user?.role === "admin" || user?.role === "organisateur") && (
                      <div className="flex items-center gap-3">
                        <Link to={`/events/${e._id}/edit`} className="text-dusk/70 hover:text-primary">
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="text-red-500 transition hover:text-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="col-span-full text-center text-dusk/60">Aucun événement à venir trouvé. Revenez très bientôt !</p>
          )}
        </div>
      </div>
    </section>
  );
}
