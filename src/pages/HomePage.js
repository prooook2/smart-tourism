import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

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

  return (
    <div className="min-h-screen bg-gray-50 text-center">
      <section className="bg-indigo-700 text-white py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Bienvenue sur la Plateforme Culturelle et Touristique 🌍
        </h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Découvrez des événements culturels, des attractions touristiques et des expériences uniques. 
          Rejoignez la communauté pour explorer le monde autrement !
        </p>
        {user ? (
          <Link
            to="/dashboard"
            className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
          >
            Accéder à votre tableau de bord
          </Link>
        ) : (
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-yellow-400 text-indigo-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              S’inscrire
            </Link>
            <Link
              to="/login"
              className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
            >
              Se connecter
            </Link>
          </div>
        )}
      </section>

      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-indigo-700 mb-3">Notre Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          La plateforme culturelle et touristique vise à promouvoir la découverte de nouveaux lieux et 
          d’événements uniques à travers le pays. Que vous soyez un visiteur, un organisateur ou un passionné 
          de culture, notre mission est de vous rapprocher des expériences authentiques.
        </p>
      </section>

      <section className="bg-white py-12 px-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Événements à venir</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-indigo-700">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString()} — {event.location?.city}
                </p>
                <p className="mt-2 text-gray-700">{event.description?.slice(0, 80)}...</p>
                <Link
                  to={`/events/${event._id}`}
                  className="text-indigo-600 hover:underline mt-2 inline-block"
                >
                  Voir plus
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucun événement à venir pour le moment.</p>
          )}
        </div>
      </section>

      <section className="text-center py-12 bg-indigo-600 text-white">
        <h2 className="text-2xl font-bold mb-4">Vous organisez un événement ?</h2>
        <p className="mb-6">Partagez-le avec des milliers de visiteurs passionnés !</p>
        <Link
          to="/event-create"
          className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
        >
          Créer un événement
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
