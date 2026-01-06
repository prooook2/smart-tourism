import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import SkeletonEventCard from "../components/SkeletonEventCard";
import SaveEventButton from "../components/SaveEventButton";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        if (!params.get("limit")) params.set("limit", "9");
        if (!params.get("page")) params.set("page", "1");
        if (!searchParams.toString()) params.set("upcoming", "true");

        const currentPage = Number(params.get("page")) || 1;
        setPage(currentPage);

        const url = `http://localhost:5000/api/events?${params.toString()}`;

        const res = await axios.get(url);
        setEvents(res.data.events || []);
        setPages(res.data.pages || 1);
      } catch (error) {
        toast.error("Erreur lors du chargement des événements");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    if (!params.get("limit")) params.set("limit", "9");
    setSearchParams(params);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

    const backupEvents = events;
    setEvents((prev) => prev.filter((event) => event._id !== id));
    toast.success("Événement supprimé");

    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setEvents(backupEvents);
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
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonEventCard key={`skeleton-${i}`} />
              ))}
            </>
          ) : events.length > 0 ? (
            events.map((e) => {
              const eventDate = new Date(e.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
              let timeIndicator = "";
              if (daysUntil < 0) {
                timeIndicator = "Passé";
              } else if (daysUntil === 0) {
                timeIndicator = "Aujourd'hui 🎉";
              } else if (daysUntil === 1) {
                timeIndicator = "Demain ⏰";
              } else {
                timeIndicator = `Dans ${daysUntil}j ⏰`;
              }

              const hasTicketTypes = e.ticketTypes?.length > 0;
              const minPrice = hasTicketTypes
                ? Math.min(...e.ticketTypes.map((t) => Number(t.price) || 0))
                : e.price || 0;
              const priceLabel = minPrice > 0 ? `À partir de ${minPrice} €` : "Gratuit";

              return (
                <article
                  key={e._id}
                  className="flex h-full flex-col rounded-3xl border border-pink-50 bg-white/95 shadow-lg shadow-primary/10 transition hover:-translate-y-1"
                >
                  {e.image && (
                    <img
                      src={e.image}
                      alt={e.title}
                      loading="lazy"
                      className="h-48 w-full rounded-t-3xl object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {e.category && (
                          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {e.category}
                          </span>
                        )}
                        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                          {new Date(e.date).toLocaleDateString()} · {e.location?.city || "À confirmer"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {priceLabel}
                        </span>
                        <SaveEventButton eventId={e._id} />
                      </div>
                    </div>

                    <h3 className="mt-3 text-2xl font-semibold text-ink">{e.title}</h3>

                    {/* Organizer Info */}
                    {e.organizer && (
                      <div className="mt-2 text-xs text-dusk/60">
                        👤 {e.organizer.name || "Organisateur"}
                      </div>
                    )}

                    <p className="mt-3 flex-1 text-sm text-dusk/70">
                      {e.description?.slice(0, 140) || "Découvrez une expérience immersive sélectionnée par nos curateurs."}
                    </p>

                    {/* Info Badges Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-pink-100 pt-3 text-xs font-semibold">
                      <span className="inline-block rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
                        {timeIndicator}
                      </span>
                      {e.avgRating > 0 && (
                        <span className="inline-block rounded-full bg-yellow-50 px-2.5 py-1 text-yellow-700">
                          ⭐ {e.avgRating.toFixed(1)}
                        </span>
                      )}
                      {e.capacity && (
                        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                          👥 {e.attendees?.length || 0}/{e.capacity}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                      <Link to={`/events/${e._id}`} className="text-primary hover:underline" aria-label={`Voir les détails de ${e.title}`}>
                        Voir les détails →
                      </Link>
                      {(user?.role === "admin" || user?.role === "organisateur") && (
                        <div className="flex items-center gap-3">
                          <Link to={`/events/${e._id}/edit`} className="text-dusk/70 hover:text-primary" aria-label={`Modifier ${e.title}`}>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(e._id)}
                            className="text-red-500 transition hover:text-red-600"
                            aria-label={`Supprimer ${e.title}`}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="text-6xl">🎭</div>
              <h3 className="text-xl font-semibold text-ink">Aucun événement trouvé</h3>
              <p className="text-dusk/60">
                {searchParams.toString() 
                  ? "Essayez d'ajuster vos critères de recherche." 
                  : "Revenez bientôt pour découvrir des événements fascinants !"}
              </p>
              <Link
                to="/events"
                className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Réinitialiser la recherche
              </Link>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-full border border-dusk/20 px-4 py-2 text-sm font-semibold text-dusk transition hover:bg-dusk/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Précédent
            </button>
            <span className="text-sm font-semibold text-dusk/70">
              Page {page} / {pages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pages}
              className="rounded-full border border-dusk/20 px-4 py-2 text-sm font-semibold text-dusk transition hover:bg-dusk/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
