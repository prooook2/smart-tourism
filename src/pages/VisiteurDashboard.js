import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "../components/LogoutButton";


const VisiteurDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "visiteur") {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        Tableau de bord Visiteur
      </h1>
      <p className="text-gray-600 mb-6">
        Découvrez les événements disponibles et partagez vos avis !
      </p>

      <button
        onClick={() => navigate("/events")}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        🎟️ Voir les événements
      </button>
      <LogoutButton />

    </div>
  );
};

export default VisiteurDashboard;
