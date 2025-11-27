import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      toast.success("📩 Email de réinitialisation envoyé !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de l'email");
    }
  };

  return (
    <AuthLayout
      badge="Assistance"
      title="Un lien pour repartir du bon pied."
      subtitle="Indiquez votre email et nous vous enverrons un lien de réinitialisation sécurisé."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dusk" htmlFor="reset-email">
            Email associé au compte
          </label>
          <input
            id="reset-email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Envoyer le lien de réinitialisation
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
