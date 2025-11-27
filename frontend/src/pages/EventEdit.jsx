import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function EventEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setForm(res.data.event);
        setPreview(res.data.event.image);
      } catch (err) {
        toast.error("Erreur lors du chargement");
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("date", form.date);
    fd.append("category", form.category);
    fd.append("capacity", form.capacity);
    fd.append("location", JSON.stringify(form.location));

    if (image) fd.append("image", image);

    try {
      await axios.put(`http://localhost:5000/api/events/${id}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Événement mis à jour !");
      navigate("/events");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (!form) return <p className="text-center mt-10 text-dusk/60">Chargement…</p>;

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-[#fff0f6] to-[#ffe1ee] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-2xl shadow-primary/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Éditer</p>
          <h1 className="mt-4 text-4xl font-bold text-ink">Affinez votre expérience</h1>
          <p className="mt-3 text-dusk/70">
            Actualisez les informations de votre événement pour offrir une expérience toujours plus mémorable.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-pink-50 bg-white/95 p-6 shadow-lg shadow-primary/10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-dusk">Titre</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-dusk">Catégorie</label>
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-dusk">Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-dusk">Date & heure</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.date?.slice(0, 16)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-dusk">Capacité</label>
              <input
                type="number"
                className={inputClass}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-dusk">Ville</label>
              <input
                className={inputClass}
                value={form.location?.city || ""}
                onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-dusk">Image de couverture</label>
            <input
              type="file"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              className="text-sm text-dusk/70"
            />
            {preview && <img src={preview} className="h-64 w-full rounded-3xl object-cover shadow-inner" />}
          </div>

          <div className="flex justify-end">
            <button className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5">
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
