import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { fetchMyNotifications } from "../utils/notifications";

const typeColors = {
  reminder: "text-amber-700 bg-amber-50 border-amber-200",
  update: "text-blue-700 bg-blue-50 border-blue-200",
  cancellation: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const formatDay = (value) =>
    new Date(value).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatHour = (value) =>
    new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchMyNotifications(token, 80);
        setNotifications(data);
      } catch (err) {
        toast.error("Impossible de charger les notifications");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const grouped = useMemo(() => {
    const groups = {};
    notifications.forEach((n) => {
      const day = new Date(n.createdAt).toISOString().split("T")[0];
      groups[day] = groups[day] || [];
      groups[day].push(n);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [notifications]);

  if (loading) return <Spinner />;

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#f5f7ff] to-[#eef2ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Notifications</p>
            <h1 className="text-3xl font-bold text-ink">Vos alertes événementielles</h1>
            <p className="text-sm text-dusk/70">Rappels, mises à jour et annulations envoyés par les organisateurs.</p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-white/90 px-4 py-3 text-sm text-dusk/80 shadow-primary/10 shadow-lg">
            <span className="font-semibold text-primary">{notifications.length}</span> messages reçus
          </div>
        </header>

        {notifications.length === 0 && (
          <div className="rounded-3xl border border-dusk/10 bg-white/95 p-8 text-center shadow-md shadow-primary/10">
            <p className="text-xl font-semibold text-ink">Aucune notification pour le moment</p>
            <p className="mt-2 text-sm text-dusk/70">Vous verrez ici les rappels et annonces des événements que vous suivez.</p>
          </div>
        )}

        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dusk/60">
                {formatDay(day)}
              </p>
              <div className="space-y-3">
                {items.map((n) => {
                  const chip = typeColors[n.type] || typeColors.update;
                  return (
                    <article
                      key={n._id}
                      className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-lg shadow-primary/10 backdrop-blur"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${chip}`}>
                            ● {n.type === "cancellation" ? "Annulation" : n.type === "reminder" ? "Rappel" : "Mise à jour"}
                          </span>
                          <p className="text-sm text-dusk/70">{formatHour(n.createdAt)}</p>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">{n.status}</p>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-ink">{n.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-dusk/80">{n.message}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-dusk/70">
                        {n.event && (
                          <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-dusk">
                            {n.event.title} · {n.event.date ? new Date(n.event.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : "Date à venir"}
                          </span>
                        )}
                        {n.sender && <span>Par {n.sender.name || n.sender.email}</span>}
                        <span>{n.recipients?.length || 0} destinataires</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
