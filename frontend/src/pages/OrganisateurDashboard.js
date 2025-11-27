import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";

const OrganisateurDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "organisateur") {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [user, navigate]);

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
