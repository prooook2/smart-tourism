import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import SaveEventButton from "../components/SaveEventButton";
import EventReviewSection from "../components/EventReviewSection";
import { sendEventNotification } from "../utils/notifications";

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
  const { t } = useTranslation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [notifyData, setNotifyData] = useState({ type: "reminder", title: "", message: "", includeSaved: false });
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load event
  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data.event);

        if (res.data.event.ticketTypes?.length) {
          const firstAvailable = res.data.event.ticketTypes.find(
            (t) => (t.quantity || 0) - (t.sold || 0) > 0
          );
          setSelectedTicketId(firstAvailable?._id || res.data.event.ticketTypes[0]._id);
        }

        // If user already registered
        if (token && res.data.event.attendees?.some(a => a._id === user._id)) {
          setRegistered(true);
        }
      } catch (err) {
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id, token, user._id]);

  // Register for FREE event
  const handleRegister = async () => {
    if (event.ticketTypes?.length && !selectedTicketId) {
      toast.error(t("events.chooseTicket"));
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/events/${id}/register`,
        event.ticketTypes?.length ? { ticketTypeId: selectedTicketId } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("events.registrationSuccess"));
      setRegistered(true);
      setEvent({ ...event, attendees: [...event.attendees, user] });
    } catch (err) {
      toast.error(err.response?.data?.message || t("common.error"));
    }
  };

  // Cancel registration
  const handleCancel = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/events/${id}/cancel`,
        event.ticketTypes?.length ? { ticketTypeId: selectedTicketId } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("events.cancellationSuccess"));
      setRegistered(false);
      setEvent({
        ...event,
        attendees: event.attendees.filter(a => a._id !== user._id),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t("common.error"));
    }
  };

  // Stripe payment
  const handlePayment = async () => {
    if (event.ticketTypes?.length && !selectedTicketId) {
      toast.error(t("events.chooseTicket"));
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/payments/create-checkout-session",
        { eventId: event._id, ticketTypeId: selectedTicketId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.url; // Redirect to Stripe
    } catch (err) {
      toast.error(t("events.paymentError"));
    }
  };

  const organizerId = event?.organizer?._id || event?.organizer;
  const canNotify = token && (user.role === "admin" || organizerId === user._id);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifyData.message.trim()) {
      toast.error(t("events.addMessage"));
      return;
    }
    try {
      setSending(true);
      await sendEventNotification(id, notifyData, token);
      toast.success(t("events.notificationSent"));
      setNotifyData({ ...notifyData, message: "", title: notifyData.title });
    } catch (err) {
      const msg = err.response?.data?.message || t("events.sendError");
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-dusk/60">{t("common.loading")}</div>;
  if (!event) return <div className="text-center mt-10 text-dusk/60">{t("events.notFound")}</div>;

  const hasTicketTypes = event.ticketTypes?.length > 0;
  const selectedTicket = hasTicketTypes
    ? event.ticketTypes.find((t) => t._id === selectedTicketId) || event.ticketTypes[0]
    : null;
  const minTicketPrice = hasTicketTypes
    ? Math.min(...event.ticketTypes.map((t) => Number(t.price) || 0))
    : null;
  const isPaidEvent = hasTicketTypes
    ? (selectedTicket?.price || 0) > 0 || minTicketPrice > 0
    : event.price && event.price > 0;
  const isFull = event.attendees.length >= event.capacity;


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
            <div className="mt-4 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold text-ink">{event.title}</h1>
              <SaveEventButton eventId={event._id} />
            </div>
            <p className="mt-4 text-dusk/80 leading-relaxed">{event.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-dusk/70">
              <span className="rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary">
                {hasTicketTypes
                  ? minTicketPrice && minTicketPrice > 0
                    ? `${t("events.from")} ${minTicketPrice} € · ${t("events.billing")}`
                    : t("events.availableTickets")
                  : isPaidEvent
                    ? `${event.price} € · ${t("events.billing")}`
                    : t("events.free")}
              </span>
              <span>{t("events.organizer")} {event.organizer?.name || "—"}</span>
              <span>
                {t("events.capacity")} {event.attendees?.length || 0} / {event.capacity || "—"}
              </span>
            </div>

          {hasTicketTypes && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-dusk">{t("events.chooseTicket")}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {event.ticketTypes.map((t) => {
                  const remaining = (t.quantity || 0) - (t.sold || 0);
                  const soldOut = remaining <= 0;
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => !soldOut && setSelectedTicketId(t._id)}
                      className={`flex flex-col rounded-2xl border p-4 text-left transition ${
                        selectedTicketId === t._id ? "border-primary bg-primary/10" : "border-pink-100 bg-white"
                      } ${soldOut ? "opacity-50" : "hover:-translate-y-0.5"}`}
                      disabled={soldOut}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-ink">{t.label}</div>
                        <div className="text-sm font-semibold text-primary">
                          {t.price > 0 ? `${t.price} €` : "Gratuit"}
                        </div>
                      </div>
                      {t.description && <p className="mt-1 text-xs text-dusk/70">{t.description}</p>}
                      <div className="mt-2 text-xs font-semibold text-dusk/80">
                        {soldOut ? t("events.soldOut") : `${remaining} ${t("events.remaining")}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

         <div className="mt-8">
  {token ? (
    isPaidEvent ? (
      registered ? (
        // Already paid → can cancel
        <button
          onClick={handleCancel}
          className="rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          {t("events.cancel")}
        </button>
      ) : isFull ? (
        // Paid event but full → disable button
        <button
          disabled
          className="rounded-full bg-gray-400 px-6 py-3 text-sm font-semibold text-white cursor-not-allowed"
        >
          {t("events.full")}
        </button>
      ) : (
        // Paid event & not registered & not full → buy ticket
        <button
          onClick={handlePayment}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          {t("events.purchase")}
        </button>
      )
      ) : registered ? (
        // FREE event → already registered
        <button
          onClick={handleCancel}
          className="rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          {t("events.cancel")}
        </button>
      ) : isFull ? (
        // Free event but full → block
        <button
          disabled
          className="rounded-full bg-gray-400 px-6 py-3 text-sm font-semibold text-white cursor-not-allowed"
        >
          {t("events.full")}
        </button>
      ) : (
        // Free event & not full → allow register
        <button
          onClick={handleRegister}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          {t("events.register")}
        </button>
      )
    ) : (
      <p className="text-sm font-semibold text-primary">
        {t("events.connect")}
      </p>
    )}
  </div>

          </div>
        </div>

        {canNotify && (
          <div className="mx-auto max-w-5xl rounded-3xl border border-primary/15 bg-white/95 p-6 shadow-lg shadow-primary/15">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("events.notification")}</p>
                <h2 className="text-2xl font-semibold text-ink">{t("events.notifyRegistered")}</h2>
                <p className="text-sm text-dusk/70">{t("events.participantsAndSaved")}</p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-dusk/80">{t("events.notificationType")}</label>
                <select
                  value={notifyData.type}
                  onChange={(e) => setNotifyData({ ...notifyData, type: e.target.value })}
                  className="w-full rounded-2xl border border-dusk/10 bg-secondary px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value="reminder">{t("events.reminder")}</option>
                  <option value="update">{t("events.update")}</option>
                  <option value="cancellation">{t("events.cancellation")}</option>
                </select>

                <label className="block text-sm font-semibold text-dusk/80">{t("events.titleLabel")}</label>
                <input
                  type="text"
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({ ...notifyData, title: e.target.value })}
                  placeholder={`Ex: ${event.title} - information importante`}
                  className="w-full rounded-2xl border border-dusk/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-dusk/80">{t("events.message")}</label>
                <textarea
                  value={notifyData.message}
                  onChange={(e) => setNotifyData({ ...notifyData, message: e.target.value })}
                  rows={5}
                  placeholder="Partagez le lieu, l'heure d'arrivée, ou toute mise à jour logistique."
                  className="w-full rounded-2xl border border-dusk/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />

                <label className="inline-flex items-center gap-2 text-sm font-semibold text-dusk/80">
                  <input
                    type="checkbox"
                    checked={notifyData.includeSaved}
                    onChange={(e) => setNotifyData({ ...notifyData, includeSaved: e.target.checked })}
                    className="h-4 w-4 rounded border-dusk/40 text-primary focus:ring-primary"
                  />
                  {t("events.includeSaved")}
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? t("events.sending") : t("events.sendNotification")}
                </button>
              </div>
            </form>
          </div>
        )}

        <EventReviewSection eventId={id} isRegistered={registered} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("events.community")}</p>
            <h3 className="mt-3 text-2xl font-semibold text-ink">{t("events.participants")}</h3>
            {event.attendees?.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {event.attendees.map((a) => (
                  <li key={a._id} className="rounded-2xl border border-dusk/10 bg-secondary px-4 py-2 text-sm text-dusk">
                    {a.name || a.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-dusk/60">{t("events.noParticipants")}</p>
            )}
          </div>

          {event.location?.coords && (
            <div className="rounded-3xl border border-pink-50 bg-white/95 p-2 shadow-lg shadow-primary/10">
              <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("events.location")}</p>
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
