import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      toast.success("✅ Mot de passe réinitialisé !");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation");
    }
  };

  return (
    <AuthLayout
      badge="Sécurité"
      title="Définissez un nouveau mot de passe."
      subtitle="Créez une combinaison forte pour sécuriser vos expériences et vos données."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dusk" htmlFor="new-password">
            Nouveau mot de passe
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Mettre à jour mon mot de passe
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
