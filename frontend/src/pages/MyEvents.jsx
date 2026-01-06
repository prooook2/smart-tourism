import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function MyEvents() {
  const [created, setCreated] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?._id) return;
    async function load() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [createdRes, allRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/events?organizer=${user._id}&limit=100`),
          axios.get(`http://localhost:5000/api/events?limit=100`, { headers }),
        ]);

        setCreated(createdRes.data.events || []);
        const registeredEvents = (allRes.data.events || []).filter((e) =>
          e.attendees?.some((a) => a._id === user._id)
        );
        setRegistered(registeredEvents);
      } catch (err) {
        console.error("My events error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, user._id]);

  if (loading) return <Spinner />;

  const isCreator = user.role === "organisateur" || user.role === "admin";

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#f7f9ff] to-[#eef2ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Mon espace</p>
          <h1 className="text-3xl font-bold text-ink">Mes événements</h1>
          <p className="text-sm text-dusk/70">{isCreator ? "Créés par moi · " : ""}Réservés par moi</p>
        </header>

        <div className={`grid gap-6 ${isCreator ? "md:grid-cols-2" : ""}`}>
          {isCreator && (
            <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-md shadow-primary/10">
              <h2 className="text-xl font-semibold text-ink">Événements créés</h2>
              {created.length ? (
                <ul className="mt-4 space-y-3 text-sm text-dusk">
                  {created.map((e) => (
                    <li key={e._id} className="rounded-xl border border-dusk/10 bg-secondary px-4 py-3">
                      <div className="font-semibold text-ink">{e.title}</div>
                      <div className="text-xs text-dusk/70">
                        {new Date(e.date).toLocaleDateString()} · {e.location?.city || "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-dusk/70">Aucun événement créé pour le moment.</p>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-md shadow-primary/10">
            <h2 className="text-xl font-semibold text-ink">Événements réservés</h2>
            {registered.length ? (
              <ul className="mt-4 space-y-3 text-sm text-dusk">
                {registered.map((e) => (
                  <li key={e._id} className="rounded-xl border border-dusk/10 bg-secondary px-4 py-3">
                    <div className="font-semibold text-ink">{e.title}</div>
                    <div className="text-xs text-dusk/70">
                      {new Date(e.date).toLocaleDateString()} · {e.location?.city || "—"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-dusk/70">Aucune réservation pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
