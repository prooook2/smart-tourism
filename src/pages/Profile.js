import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState({});
const [events, setEvents] = useState({
  organized: [],
  registered: [],
});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({ name: res.data.name, email: res.data.email, password: "" });
      } catch (error) {
        console.error(error);
      }
    };

    const fetchEvents = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users/my-events", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEvents({
      organized: res.data.organized || [],
      registered: res.data.registered || [],
    });
  } catch (err) {
    console.error(err);
  }
};


    fetchProfile();
    fetchEvents();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("http://localhost:5000/api/users/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profil mis à jour !");
      setUser(res.data.user);
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur de mise à jour");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleUpload = async (file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await axios.put(
      "http://localhost:5000/api/users/me/avatar",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Photo de profil mise à jour !");
    setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Échec de l'upload");
  }
};


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        
              {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full bg-gray-200 shadow-inner overflow-hidden flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
            <span className="text-4xl text-gray-500">👤</span>
            )}

        </div>

        {/* Upload button */}
        <label className="mt-2 cursor-pointer flex items-center gap-1 text-indigo-600 font-semibold hover:underline">
        <span className="text-lg">+</span> Ajouter une photo
        <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
        />
        </label>

      </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Modifier le profil
          </button>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <input className="w-full border p-2 rounded" name="name" value={formData.name} onChange={handleChange} />
            <input className="w-full border p-2 rounded" name="email" value={formData.email} onChange={handleChange} />
            <input className="w-full border p-2 rounded" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Nouveau mot de passe" />

            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save</button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Déconnexion
        </button>

        {/* Events section preview */}
        <h3 className="mt-6 text-xl font-bold">Mes événements inscrits</h3>

            {events.registered.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun événement pour le moment</p>
            ) : (
            <ul className="mt-3 space-y-2">
                {events.registered.map((ev) => (
                <li key={ev._id} className="p-2 border rounded shadow-sm bg-gray-50">
                    {ev.title} — {new Date(ev.date).toLocaleDateString()}
                </li>
                ))}
            </ul>
            )}
            <h3 className="mt-6 text-xl font-bold">Mes événements enregistrés</h3>
            {events.registered?.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun événement inscrit</p>
            ) : (
            <ul className="mt-3 space-y-2">
                {events.registered.map((ev) => (
                <li key={ev._id} className="p-2 border rounded shadow-sm bg-gray-50">
                    {ev.title} — {new Date(ev.date).toLocaleDateString()}
                </li>
                ))}
            </ul>)}

            <h3 className="mt-6 text-xl font-bold">Mes événements organisés</h3>

        {events.organized.length === 0 ? (
        <p className="text-gray-500 text-sm">Vous n'avez pas encore créé d'événements</p>
        ) : (
        <ul className="mt-3 space-y-2">
            {events.organized.map((ev) => (
            <li key={ev._id} className="p-2 border rounded shadow-sm bg-gray-50">
                {ev.title} — {new Date(ev.date).toLocaleDateString()}
            </li>
            ))}
        </ul>
        )}

      </div>
    </div>
  );
};

export default Profile;
