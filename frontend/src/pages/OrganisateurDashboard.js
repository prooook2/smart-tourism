import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";

const OrganisateurDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "organisateur") {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/metrics/organizer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des métriques", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  const roadmap = [
    {
      step: "01",
      title: "Publiez votre concept",
      description: "Ajoutez un lieu, des visuels premium et un storytelling immersif.",
    },
    {
      step: "02",
      title: "Activez la billetterie",
      description: "Suivez vos réservations en temps réel et sécurisez les paiements.",
    },
    {
      step: "03",
      title: "Analysez & fidélisez",
      description: "Obtenez des insights sur vos visiteurs pour affiner vos prochaines éditions.",
    },
  ];

  const metricsStats = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: "Billets vendus", value: metrics.ticketsSold, icon: "🎟️" },
      { label: "Revenus", value: `${metrics.totalRevenue.toFixed(2)} €`, icon: "💰" },
      { label: "Taux de participation", value: `${metrics.participationRate}%`, icon: "📊" },
    ];
  }, [metrics]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff0f6] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-primary/20 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Espace organisateur</p>
              <h1 className="mt-4 text-4xl font-bold text-ink">Prêt à créer votre prochaine scène ?</h1>
              <p className="mt-3 text-dusk/70">
                Pilotez vos expériences, centralisez vos invités et surclassez votre univers événementiel.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/events/create")}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                >
                  ➕ Créer un événement
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                >
                  Voir la programmation
                </button>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>

        {!loading && metrics && (
          <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-2xl shadow-primary/15 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Vos statistiques</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {metricsStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-pink-50 bg-secondary p-4 shadow-md shadow-primary/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-dusk/70">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-primary">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {roadmap.map((item) => (
            <div key={item.step} className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-dusk/50">{item.step}</p>
              <h2 className="mt-4 text-2xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-dusk/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrganisateurDashboard;
