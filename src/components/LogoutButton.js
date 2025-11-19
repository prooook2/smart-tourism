import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

const LogoutButton = () => {
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
      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition absolute top-4 right-4"
    >
      <FiLogOut />
      Déconnexion
    </button>
  );
};

export default LogoutButton;
