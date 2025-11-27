import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "visiteur",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success("✅ Inscription réussie !");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'inscription");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <AuthLayout
      badge="Création de compte"
      title="Élaborez des voyages iconiques."
      subtitle="Rejoignez la communauté Smart Tourism et offrez à vos visiteurs des expériences raffinées et orchestrées."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-dusk" htmlFor="name">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alexia Dupont"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-dusk" htmlFor="role">
              Profil
            </label>
            <select
              id="role"
              className={`${inputClass} appearance-none cursor-pointer`}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              value={formData.role}
            >
              <option value="visiteur">Visiteur curateur</option>
              <option value="organisateur">Organisateur d’expériences</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-dusk" htmlFor="email">
            Email de contact
          </label>
          <input
            id="email"
            type="email"
            placeholder="vous@maisoncreative.com"
            className={inputClass}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-dusk" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={inputClass}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Créer mon compte
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-dusk/50">
        <span className="h-px flex-1 bg-pink-100" />
        ou
        <span className="h-px flex-1 bg-pink-100" />
      </div>

      <button
        onClick={handleGoogleSignup}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dusk/10 bg-white px-5 py-3 text-sm font-semibold text-dusk shadow-sm transition hover:border-primary/40 hover:text-primary"
      >
        <FcGoogle className="text-2xl" />
        S’inscrire avec Google
      </button>

      <p className="text-center text-sm text-dusk/70">
        Vous avez déjà un compte ?{" "}
        <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
