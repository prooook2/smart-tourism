import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const markerIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load event
  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data.event);

        // If user already registered
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

  // Register for FREE event
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

  // Cancel registration
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

  // Stripe payment
  const handlePayment = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payments/create-checkout-session",
        { eventId: event._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.url; // Redirect to Stripe
    } catch (err) {
      toast.error("Erreur lors du paiement");
    }
  };

  if (loading) return <div className="text-center mt-10 text-dusk/60">Chargement...</div>;
  if (!event) return <div className="text-center mt-10 text-dusk/60">Événement introuvable.</div>;

  const isPaidEvent = event.price && event.price > 0;

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-2xl shadow-primary/20 backdrop-blur">
          {event.image && (
            <img src={event.image} alt={event.title} className="h-80 w-full object-cover" />
          )}
          <div className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {new Date(event.date).toLocaleDateString()} · {event.location?.city || "Lieu confirmé prochainement"}
            </p>
            <h1 className="mt-4 text-4xl font-bold text-ink">{event.title}</h1>
            <p className="mt-4 text-dusk/80 leading-relaxed">{event.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-dusk/70">
              <span className="rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary">
                {isPaidEvent ? `${event.price} € · Billetterie` : "Événement gratuit"}
              </span>
              <span>Organisé par {event.organizer?.name || "—"}</span>
              <span>
                Capacité {event.attendees?.length || 0} / {event.capacity || "—"}
              </span>
            </div>

            <div className="mt-8">
              {token ? (
                isPaidEvent ? (
                  registered ? (
                    <button
                      onClick={handleCancel}
                      className="rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Annuler ma participation
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                    >
                      Acheter un billet
                    </button>
                  )
                ) : registered ? (
                  <button
                    onClick={handleCancel}
                    className="rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Annuler ma participation
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  >
                    Réserver ma place
                  </button>
                )
              ) : (
                <p className="text-sm font-semibold text-primary">
                  Connectez-vous pour réserver cette expérience.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Communauté</p>
            <h3 className="mt-3 text-2xl font-semibold text-ink">Participants inscrits</h3>
            {event.attendees?.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {event.attendees.map((a) => (
                  <li key={a._id} className="rounded-2xl border border-dusk/10 bg-secondary px-4 py-2 text-sm text-dusk">
                    {a.name || a.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-dusk/60">Aucun participant pour le moment.</p>
            )}
          </div>

          {event.location?.coords && (
            <div className="rounded-3xl border border-pink-50 bg-white/95 p-2 shadow-lg shadow-primary/10">
              <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Localisation</p>
              <div className="mt-4 overflow-hidden rounded-2xl">
                <MapContainer center={event.location.coords} zoom={13} style={{ height: "320px", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={event.location.coords} icon={markerIcon} />
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
