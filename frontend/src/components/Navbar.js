import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const roleDashboard = {
    admin: "/admin-dashboard",
    organisateur: "/organisateur-dashboard",
    visiteur: "/visiteur-dashboard",
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-pink-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            ✦
          </span>
          <div className="leading-tight">
            <p className="text-base uppercase tracking-[0.2em] text-dusk">Smart</p>
            <p className="text-lg text-primary">Tourism</p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-dusk md:flex">
          <Link to="/" className="hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link to="/events" className="hover:text-primary transition-colors">
            Événements
          </Link>
          <Link to="/register" className="hover:text-primary transition-colors">
            Inscription
          </Link>
          <Link to="/login" className="hover:text-primary transition-colors">
            Connexion
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (user.role === "organisateur" || user.role === "admin") && (
            <Link
              to="/events/create"
              className="hidden rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/10 md:inline-flex"
            >
              Ajouter un événement
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-dusk/70">Connecté</p>
                <p className="text-sm font-semibold text-ink">
                  {user.name} · {user.role}
                </p>
              </div>
              <Link
                to={roleDashboard[user.role] || "/profile"}
                className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 md:inline-flex"
              >
                Tableau de bord
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-dusk/10 px-3 py-2 text-sm font-semibold text-dusk transition hover:bg-dusk/5"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
