import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";


const OrganisateurDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "organisateur") {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        Tableau de bord Organisateur
      </h1>
      <p className="text-gray-600 mb-6">
        Gérez vos événements et suivez les participants ici.
      </p>

      <button
        onClick={() => navigate("/create-event")}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        ➕ Créer un événement
      </button>
      <LogoutButton />

    </div>
  );
};

export default OrganisateurDashboard;
