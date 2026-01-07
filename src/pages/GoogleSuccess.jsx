import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (!token) {
        toast.error("❌ Token manquant ou invalide");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("✅ Connecté avec Google !");

 
        
        setTimeout(() => {
            

          if (user.role === "admin") navigate("/admin-dashboard");
          else if (user.role === "organisateur") navigate("/organisateur-dashboard");
          else navigate("/visiteur-dashboard");
        }, 1500);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la récupération des informations utilisateur");
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-lg text-gray-700">Connexion en cours avec Google...</p>
    </div>
  );
};

export default GoogleSuccess;
