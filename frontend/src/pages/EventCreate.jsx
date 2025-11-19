import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function EventCreate() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    capacity: 0,
    location: { city: "" },
  });

  const [image, setImage] = useState(null); // uploaded file
  const [preview, setPreview] = useState(null); // preview image

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 📸 Handle image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file)); // show preview
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
      fd.append("location", JSON.stringify(form.location));

      if (image) fd.append("image", image); // ⬅️ IMPORTANT

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
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Créer un événement</h2>

      <form onSubmit={submit} className="space-y-3">
        
        {/* IMAGE UPLOAD */}
        <div>
          <label className="block font-semibold mb-1">Image de l’événement</label>
          <input 
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full p-2 border"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-48 mt-2 object-cover rounded"
            />
          )}
        </div>

        <input
          name="title"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titre"
          required
          className="w-full p-2 border"
        />

        <textarea
          name="description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          required
          className="w-full p-2 border"
        />

        <input
          type="datetime-local"
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full p-2 border"
        />

        <input
          name="category"
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Catégorie"
          className="w-full p-2 border"
        />

        <input
          name="location.city"
          placeholder="Ville"
          onChange={(e) =>
            setForm({ ...form, location: { city: e.target.value } })
          }
          className="w-full p-2 border"
        />

        <input
          type="number"
          placeholder="Capacité"
          onChange={(e) =>
            setForm({ ...form, capacity: Number(e.target.value) })
          }
          className="w-full p-2 border"
        />



        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Créer
        </button>
      </form>
    </div>
  );
}
