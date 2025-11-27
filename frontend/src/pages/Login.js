import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full rounded-2xl border border-pink-100 bg-secondary/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔹 Normal login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

     
    
      setTimeout(() => {
        if (res.data.user.role === "admin") navigate("/admin-dashboard");
        else if (res.data.user.role === "organisateur") navigate("/organisateur-dashboard");
        else navigate("/visiteur-dashboard");
        }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de la connexion");
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // 🔹 Handle redirect back from Google
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
  if (!token) return;

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("✅ Connecté avec Google !");

      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin-dashboard");
        else if (res.data.role === "organisateur") navigate("/organisateur-dashboard");
        else navigate("/visiteur-dashboard");
      }, 1000);
    } catch (err) {
      toast.error("Erreur lors de la récupération du profil utilisateur");
      navigate("/login");
    }
  };

  // Prevent re-run in Strict Mode
  if (!sessionStorage.getItem("googleLoginHandled")) {
    sessionStorage.setItem("googleLoginHandled", "true");
    fetchUser();
  }
}, [navigate]);

  return (
    <AuthLayout
      badge="Connexion sécurisée"
      title="Ravi de vous revoir."
      subtitle="Reprenez l’exploration d’expériences uniques et suivez vos réservations en temps réel."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dusk" htmlFor="email">
            Email professionnel
          </label>
          <input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Se connecter
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-dusk/50">
        <span className="h-px flex-1 bg-pink-100" />
        ou
        <span className="h-px flex-1 bg-pink-100" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dusk/10 bg-white px-5 py-3 text-sm font-semibold text-dusk shadow-sm transition hover:border-primary/40 hover:text-primary"
      >
        <FcGoogle size={22} />
        Continuer avec Google
      </button>

      <p className="text-center text-sm text-dusk/70">
        Nouveau sur Smart Tourism ?{" "}
        <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
