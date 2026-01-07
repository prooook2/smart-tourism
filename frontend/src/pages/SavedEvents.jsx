import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SavedEvents() {
  const [saved, setSaved] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?._id) return;
    const key = `saved-events-${user._id}`;
    const savedIds = JSON.parse(localStorage.getItem(key) || "[]");
    setSaved(savedIds);
  }, [user._id]);

  const handleRemove = (id) => {
    const key = `saved-events-${user._id}`;
    const next = saved.filter((s) => s !== id);
    setSaved(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fdf4ff] to-[#f3e8ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Favoris</p>
          <h1 className="text-3xl font-bold text-ink">Mes événements sauvegardés</h1>
          <p className="text-sm text-dusk/70">Retrouvez ici vos coups de cœur.</p>
        </header>

        {saved.length ? (
          <ul className="space-y-4">
            {saved.map((id) => (
              <li key={id} className="flex items-center justify-between rounded-2xl border border-dusk/10 bg-white/95 px-4 py-3">
                <div className="text-sm font-semibold text-ink">Événement #{id.slice(-6)}</div>
                <div className="flex items-center gap-3 text-sm">
                  <Link to={`/events/${id}`} className="text-primary hover:underline">Voir</Link>
                  <button
                    onClick={() => handleRemove(id)}
                    className="text-red-500 hover:text-red-600"
                    aria-label="Retirer des favoris"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border border-dusk/10 bg-white/95 p-6 text-center text-sm text-dusk/70">
            Aucun événement sauvegardé pour le moment.
          </div>
        )}
      </div>
    </section>
  );
}
