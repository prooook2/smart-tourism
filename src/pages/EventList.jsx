import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

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
    <div className="p-6 bg-gray-50 min-h-screen">
      
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Événements à venir</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length > 0 ? (
          events.map((e) => (
            <div key={e._id} className="bg-white p-4 rounded shadow">
  
          {e.image && (
            <img
              src={e.image}
              alt={e.title}
              className="w-full h-40 object-cover rounded mb-2"
            />
          )}

          <h3 className="text-lg font-semibold">{e.title}</h3>
          <p className="text-sm text-gray-600">
            {new Date(e.date).toLocaleString()}
          </p>
          <p className="mt-2 text-gray-700">
            {e.description?.slice(0, 120)}...
          </p>

          <div className="mt-3 flex justify-between items-center">
            <Link
              to={`/events/${e._id}`}
              className="text-indigo-600 hover:underline"
            >
              Voir
            </Link>

            {(user?.role === "admin" || user?.role === "organisateur") && (
              <button
                onClick={() => handleDelete(e._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            )}
          </div>
              <span className="block text-sm text-gray-500 mt-2">
                {e.location?.city}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Aucun événement à venir trouvé.</p>
        )}
      </div>
    </div>
  );
}
