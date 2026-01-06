import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RecommendedEvents from "../components/RecommendedEvents";
import HeroSection from "../components/HeroSection";
import EventList from "../components/EventList";


const HomePage = () => {
  const [events, setEvents] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await axios.get("http://localhost:5000/api/events?upcoming=true");
        setEvents(res.data.events?.slice(0, 3) || []);
      } catch (err) {
        console.error("Erreur de chargement des événements :", err);
      }
    }
    loadEvents();
  }, []);

  const stats = [
    { label: "Destinations actives", value: "120+", detail: "Lieux culturels vérifiés" },
    { label: "Événements planifiés", value: "450+", detail: "Expériences immersives" },
    { label: "Communauté", value: "38k", detail: "Voyageurs inspirés" },
  ];

  const features = [
    {
      title: "Parcours immersifs",
      description: "Recommandations sur mesure selon vos passions culturelles et vos envies.",
      icon: "🌸",
    },
    {
      title: "Gestion intuitive",
      description: "Créez, publiez et gérez vos événements en quelques minutes.",
      icon: "🪄",
    },
    {
      title: "Suivi en direct",
      description: "Analysez vos réservations et interagissez avec votre audience.",
      icon: "📈",
    },
  ];

  const testimonials = [
    {
      name: "Lina – organisatrice",
      quote:
        "La plateforme modernise vraiment la promotion d’événements. En 48 h nous avions sold-out notre soirée immersive.",
    },
    {
      name: "Yanis – visiteur",
      quote:
        "Interface ultra fluide, recommandations pertinentes, paiement rassurant : c’est devenu mon compagnon de voyage.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] text-ink">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Culture & Voyage
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              La vitrine moderne des expériences culturelles et touristiques.
            </h1>
            <p className="mt-6 text-lg text-dusk/80">
              Inspirez, organisez et vivez des événements qui marquent. Nous réunissons créateurs et voyageurs autour
              d’expériences haut de gamme, portées par un design élégant et des outils intelligents.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/events"
                  className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                >
                  Explorer les événements
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-full border border-primary/30 px-8 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/70 p-4 shadow-md shadow-primary/5 backdrop-blur">
                  <p className="text-3xl font-semibold text-primary">{stat.value}</p>
                  <p className="text-sm font-semibold text-dusk">{stat.label}</p>
                  <p className="text-xs text-dusk/70">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 via-transparent to-primary/20 blur-3xl" />
            <div className="relative space-y-6 rounded-3xl bg-white/80 p-8 shadow-2xl shadow-primary/20 backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-dusk/70">01 — Aperçu</h3>
              <p className="text-2xl font-semibold text-ink">
                Un design inspiré des maisons d’édition de voyage, pensé pour rassurer vos visiteurs haut de gamme.
              </p>
              <div className="rounded-2xl border border-primary/20 p-6">
                <p className="text-sm font-medium text-dusk">Pour les organisateurs</p>
                <p className="mt-2 text-ink">
                  Automatisez vos publications, pilotez vos réservations et partagez des expériences immersives en quelques
                  clics.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-secondary p-4 shadow-inner">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                  ⏱
                </span>
                <div>
                  <p className="text-sm font-semibold text-dusk">Activation en moins de 5 minutes</p>
                  <p className="text-xs text-dusk/70">Publiez votre première expérience sans aucune friction.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-dusk/70">Ils nous font confiance</p>
        <div className="mt-8 grid grid-cols-2 gap-6 text-center text-dusk/60 sm:grid-cols-4">
          {["Nomadica", "Artevia", "Voyageur+", "Pulse Events"].map((brand) => (
            <p key={brand} className="text-lg font-semibold tracking-wide">
              {brand}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Prochainement</p>
            <h2 className="mt-4 text-3xl font-bold text-ink">Événements à ne pas manquer</h2>
            <p className="mt-3 max-w-2xl text-dusk/80">
              Sélection éditoriale des trois expériences les plus recherchées par notre communauté cette semaine.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.length > 0 ? (
              events.map((event) => (
                <article
                  key={event._id}
                  className="flex h-full flex-col rounded-3xl border border-pink-50 bg-secondary p-6 shadow-lg shadow-primary/10 transition hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.location?.city || "À confirmer"}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-ink">{event.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-dusk/80">
                    {event.description?.slice(0, 120) || "Découvrez une expérience unique imaginée par nos curateurs."}
                  </p>
                  <Link
                    to={`/events/${event._id}`}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-primary"
                  >
                    Voir les détails →
                  </Link>
                </article>
              ))
            ) : (
              <p className="col-span-full text-center text-dusk/70">
                Aucun événement à venir pour le moment. Revenez très bientôt !
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div>
          <HeroSection />
          <EventList />
          <RecommendedEvents />

          
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl bg-white/60 p-8 shadow-lg shadow-primary/10 backdrop-blur">
              <span className="text-4xl">{feature.icon}</span>
              <h3 className="mt-6 text-2xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-dusk/80">{feature.description}</p>
              <p className="mt-4 text-sm font-semibold text-primary">En savoir plus →</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.name}
                className="rounded-3xl bg-white/90 p-10 shadow-xl shadow-primary/15 backdrop-blur"
              >
                <p className="text-xl font-semibold text-ink">“{testimonial.quote}”</p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  {testimonial.name}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] bg-ink px-6 py-16 text-white shadow-2xl shadow-primary/30">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Créer votre next step</p>
          <h2 className="mt-6 text-4xl font-bold">Publiez un événement en 3 étapes.</h2>
          <p className="mt-4 text-lg text-white/70">
            Ouvrez votre scène aux voyageurs exigeants : visuels premium, paiement sécurisé et reporting en temps réel.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/events/create"
              className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Lancer un événement
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white"
            >
              Découvrir les expériences
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
