import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function EventCreate() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    capacity: 0,
    location: {
      city: "",
      address: "",
      coords: [0, 0],
    },
    price: 0,
  });

  const [useTicketTypes, setUseTicketTypes] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([
    { label: "Standard", price: 0, quantity: 50, description: "" },
  ]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [coords, setCoords] = useState({ lat: 36.8065, lng: 10.1815 });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("date", form.date);
      fd.append("category", form.category);
      fd.append("capacity", form.capacity);
      fd.append(
        "location",
        JSON.stringify({
          ...form.location,
          coords: [coords.lat, coords.lng],
        })
      );
      if (useTicketTypes) {
        fd.append("ticketTypes", JSON.stringify(ticketTypes));
      } else {
        fd.append("price", form.price);
      }
      fd.append("coords", JSON.stringify(coords));

      if (image) fd.append("image", image);

      await axios.post("http://localhost:5000/api/events", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Événement créé !");
      navigate("/events");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff5f9] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-2xl shadow-primary/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Nouveau projet</p>
          <h1 className="mt-4 text-4xl font-bold text-ink">Imaginez votre prochaine expérience.</h1>
          <p className="mt-3 text-dusk/70">
            Composez votre événement pas à pas : visuels premium, storytelling, localisation précise et capacité maîtrisée.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Contenu</p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Titre</label>
                <input
                  name="title"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Soirée immersive à Carthage"
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Catégorie</label>
                <input
                  name="category"
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Gastronomie, Art, Patrimoine..."
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <label className="text-sm font-semibold text-dusk">Description</label>
              <textarea
                name="description"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Partagez l’univers, le déroulé et la promesse de votre événement."
                required
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Date & heure</label>
                <input
                  type="datetime-local"
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Capacité</label>
                <input
                  type="number"
                  placeholder="150"
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Billetterie</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseTicketTypes(false)}
                    className={`${useTicketTypes ? "border-pink-100 text-dusk" : "border-primary bg-primary/10 text-primary"} w-1/2 rounded-xl border px-3 py-2 text-sm font-semibold`}
                  >
                    Prix unique
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseTicketTypes(true)}
                    className={`${useTicketTypes ? "border-primary bg-primary/10 text-primary" : "border-pink-100 text-dusk"} w-1/2 rounded-xl border px-3 py-2 text-sm font-semibold`}
                  >
                    Multi-tarifs
                  </button>
                </div>
                {!useTicketTypes && (
                  <input
                    type="number"
                    placeholder="75"
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className={inputClass}
                  />
                )}
              </div>
            </div>

            {useTicketTypes && (
              <div className="mt-6 space-y-4 rounded-2xl border border-pink-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-dusk">Types de billets</p>
                  <button
                    type="button"
                    onClick={() =>
                      setTicketTypes((prev) => [
                        ...prev,
                        { label: "Nouveau billet", price: 0, quantity: form.capacity || 0, description: "" },
                      ])
                    }
                    className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                  >
                    ➕ Ajouter
                  </button>
                </div>

                {ticketTypes.map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-dusk/10 bg-secondary p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        value={t.label}
                        onChange={(e) => {
                          const next = [...ticketTypes];
                          next[idx].label = e.target.value;
                          setTicketTypes(next);
                        }}
                        className={inputClass}
                        placeholder="VIP, Early bird, Standard…"
                      />
                      {ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTicketTypes((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dusk">Prix (€)</label>
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) => {
                            const next = [...ticketTypes];
                            next[idx].price = Number(e.target.value);
                            setTicketTypes(next);
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dusk">Quantité</label>
                        <input
                          type="number"
                          value={t.quantity}
                          onChange={(e) => {
                            const next = [...ticketTypes];
                            next[idx].quantity = Number(e.target.value);
                            setTicketTypes(next);
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dusk">Description (optionnel)</label>
                        <input
                          value={t.description}
                          onChange={(e) => {
                            const next = [...ticketTypes];
                            next[idx].description = e.target.value;
                            setTicketTypes(next);
                          }}
                          className={inputClass}
                          placeholder="Accès coupe-file, boisson offerte…"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Visuel signature</p>
            <div className="mt-4 space-y-3">
              <label className="text-sm font-semibold text-dusk">Image de couverture</label>
              <input type="file" accept="image/*" onChange={handleImage} className="text-sm text-dusk/70" />
              {preview && (
                <img src={preview} alt="preview" className="h-64 w-full rounded-3xl object-cover shadow-inner" />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Localisation</p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Ville</label>
                <input
                  name="location.city"
                  placeholder="Tunis, Sidi Bou, Hammamet..."
                  onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-dusk">Adresse</label>
                <input
                  name="location.address"
                  placeholder="Adresse exacte (optionnel)"
                  onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl">
              <MapContainer center={coords} zoom={13} style={{ height: "320px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onChange={(c) => setCoords({ lat: c[0], lng: c[1] })} />
                <Marker position={coords} icon={markerIcon}>
                  <Popup>Position sélectionnée</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Publier l’événement
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
