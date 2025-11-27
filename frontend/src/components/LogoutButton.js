import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

const LogoutButton = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie 👋");
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex items-center gap-2 rounded-full border border-dusk/10 px-4 py-2 text-sm font-semibold text-dusk transition hover:border-primary hover:bg-primary/5 ${className}`}
    >
      <FiLogOut className="text-primary" />
      Déconnexion
    </button>
  );
};

export default LogoutButton;
