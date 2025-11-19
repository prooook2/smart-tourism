import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data.event);

        // If backend populates attendees, check if user is among them
        if (token && res.data.event.attendees?.some(a => a._id === user._id)) {
          setRegistered(true);
        }
      } catch (err) {
        toast.error("Erreur lors du chargement de l'événement");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id, token, user._id]);

  const handleRegister = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/events/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Inscription réussie !");
      setRegistered(true);
      setEvent({ ...event, attendees: [...event.attendees, user] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'inscription");
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/events/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Désinscription réussie !");
      setRegistered(false);
      setEvent({
        ...event,
        attendees: event.attendees.filter(a => a._id !== user._id),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de désinscription");
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;
  if (!event) return <div className="text-center mt-10">Événement introuvable.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      {event.image && (
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-64 object-cover rounded mb-4"
      />
    )}
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleString()}</p>
      <p className="mt-4">{event.description}</p>
      <p className="mt-3 text-sm">Organisateur: {event.organizer?.name || "—"}</p>
      <p className="mt-1 text-sm">Ville: {event.location?.city}</p>

      <p className="mt-4 text-sm text-gray-600">
        Participants: {event.attendees?.length || 0} / {event.capacity}
      </p>

      {token ? (
        <div className="mt-6">
          {registered ? (
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Annuler l'inscription
            </button>
          ) : (
            <button
              onClick={handleRegister}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              S'inscrire à l'événement
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 text-indigo-600 font-semibold">
          Connectez-vous pour vous inscrire à cet événement.
        </p>
      )}

      {/* 🧑 Liste des participants */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Participants inscrits</h3>
        {event.attendees && event.attendees.length > 0 ? (
          <ul className="space-y-1">
            {event.attendees.map((a) => (
              <li key={a._id} className="text-gray-700">
                • {a.name || a.email}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Aucun participant pour le moment.</p>
        )}
      </div>
    </div>
  );
}
