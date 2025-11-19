import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

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

  // 🔹 Google signup
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Créer un compte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <select
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            value={formData.role}
          >
            <option value="visiteur">Visiteur</option>
            <option value="organisateur">Organisateur</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            S’inscrire
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FcGoogle className="text-2xl mr-2" />
          S’inscrire avec Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Vous avez déjà un compte ?{" "}
          <a href="/" className="text-indigo-600 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
