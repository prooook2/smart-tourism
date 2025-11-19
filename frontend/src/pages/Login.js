import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Connexion
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Se connecter
          </button>

          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-indigo-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FcGoogle size={22} className="mr-2" />
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
};

export default Login;
