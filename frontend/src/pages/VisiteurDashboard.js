import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";

const VisiteurDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "visiteur") {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [user, navigate]);

  const highlights = [
    {
      title: "Recommandations personnalisées",
      description: "Restez inspiré avec une veille culturelle adaptée à vos envies.",
      action: () => navigate("/events"),
      actionLabel: "Explorer maintenant",
    },
    {
      title: "Billets sécurisés",
      description: "Retrouvez vos réservations et billets dans votre espace profil.",
      action: () => navigate("/profile"),
      actionLabel: "Voir mon profil",
    },
    {
      title: "Mes événements",
      description: "Consulter les événements auxquels vous êtes inscrit.",
      action: () => navigate("/my-events"),
      actionLabel: "Voir mes inscriptions",
    },
    {
      title: "Coups de cœur",
      description: "Retrouvez tous vos événements favoris sauvegardés.",
      action: () => navigate("/saved-events"),
      actionLabel: "Voir mes favoris",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-[32px] border border-white/60 bg-white/90 p-8 text-center shadow-2xl shadow-primary/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Espace visiteur</p>
          <h1 className="mt-4 text-4xl font-bold text-ink">Bienvenue {user?.name} 👋</h1>
          <p className="mt-3 text-dusk/70">
            Continuez à explorer des expériences immersives, suivez vos billets et partagez vos coups de cœur.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/events")}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              🎟️ Voir les événements
            </button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-pink-50 bg-white/90 p-6 shadow-lg shadow-primary/10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-dusk/60">À découvrir</p>
              <h2 className="mt-4 text-2xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-dusk/70">{item.description}</p>
              <button
                onClick={item.action}
                className="mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {item.actionLabel} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisiteurDashboard;
