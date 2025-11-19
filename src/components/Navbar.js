import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex space-x-4">
        <Link to="/" className="font-semibold hover:text-indigo-200">
          Accueil
        </Link>

        <Link to="/events" className="font-semibold hover:text-indigo-200" aria-label="Voir les événements">
          Événements
        </Link>

        {!user && (
          <Link to="/register" className="font-semibold hover:text-indigo-200">
            Inscription
          </Link>
        )}

      
        {user && (user.role === "organisateur" || user.role === "admin") && (
            <Link
                to="/events/create"
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
            >
                Ajouter Événement
            </Link>
            )}


        
      </div>
      

      {user ? (
        <div className="flex items-center space-x-4">
          <span className="font-medium text-sm text-gray-200">
            Connecté en tant que: {user.name} ({user.role})
          </span>
            {user && (
          <>
            <Link to="/profile" className="font-semibold hover:text-indigo-200">
              Profil
            </Link>
            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="font-semibold hover:text-indigo-200">
                Dashboard
              </Link>
            )}
          </>
        )}
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded font-semibold"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded font-semibold"
        >
          Connexion
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
