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
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#fff0f6] to-[#ffd6e8] px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white/90 p-10 text-center shadow-2xl shadow-primary/20 backdrop-blur">
        <p className="inline-flex items-center justify-center rounded-full border border-primary/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Connexion sécurisée
        </p>
        <h1 className="mt-6 text-3xl font-bold text-ink">Nous vous connectons à votre univers.</h1>
        <p className="mt-4 text-dusk/70">
          Synchronisation avec votre compte Google en cours. Vous serez redirigé automatiquement.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-pink-100 border-t-primary" />
        </div>
        <p className="mt-6 text-sm text-dusk/60">Gardez cette fenêtre ouverte quelques secondes.</p>
      </div>
    </section>
  );
};

export default GoogleSuccess;
