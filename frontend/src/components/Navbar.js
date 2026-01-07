import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("q", searchTerm.trim());
    }

    // Map price range selection to min/max
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
    }

    navigate(`/events?${params.toString()}`);
    setShowSearchPanel(false);
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
            {t("nav.home")}
          </Link>
          <Link to="/events" className="hover:text-primary transition-colors">
            {t("nav.events")}
          </Link>
          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            🔍 {t("nav.search")}
          </button>
         {!token && (
          <>
            <Link to="/register" className="hover:text-primary transition-colors">
              {t("nav.register")}
            </Link>
            <Link to="/login" className="hover:text-primary transition-colors">
              {t("nav.login")}
            </Link>
          </>
        )}
        </div>

        <div className="flex items-center gap-3">
          {user && (user.role === "organisateur" || user.role === "admin") && (
            <Link
              to="/events/create"
              className="hidden rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/10 lg:inline-flex"
            >
              {t("nav.createEvent")}
            </Link>
          )}

          <LanguageSwitcher />

          {user ? (
            <div className="relative flex items-center gap-3" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full border border-dusk/10 bg-white px-3 py-2 shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <img
                  src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-ink">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-dusk/60">{user.role}</p>
                </div>
                <svg className={`h-4 w-4 text-dusk transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-dusk/10 bg-white shadow-xl">
                  <div className="p-3 border-b border-dusk/5">
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-dusk/60">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>👤</span>
                      <span>{t("nav.myProfile")}</span>
                    </Link>
                    <Link
                      to={roleDashboard[user.role] || "/profile"}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>📊</span>
                      <span>{t("nav.dashboard")}</span>
                    </Link>
                    <Link
                      to="/my-events"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>🎫</span>
                      <span>{t("nav.myEvents")}</span>
                    </Link>
                    <Link
                      to="/saved-events"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>❤️</span>
                      <span>{t("nav.favorites")}</span>
                    </Link>
                    <Link
                      to="/recommend"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>🎯</span>
                      <span>{t("nav.recommendations")}</span>
                    </Link>
                    <Link
                      to="/itinerary"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>🗺️</span>
                      <span>{t("nav.itinerary")}</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>🔔</span>
                      <span>{t("nav.notifications")}</span>
                    </Link>
                    {(user.role === "organisateur" || user.role === "admin") && (
                      <Link
                        to="/events/create"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dusk hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <span>➕</span>
                        <span>{t("nav.createEvent")}</span>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-dusk/5 py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>{t("nav.logout")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              {t("nav.loginButton")}
            </Link>
          )}
        </div>
      </div>

      {/* Search Panel */}
      {showSearchPanel && (
        <div className="border-t border-pink-50 bg-white/50 backdrop-blur px-4 py-4 md:px-6">
          <form onSubmit={handleSearch} className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-dusk/10 bg-white/80 px-4 py-3 pl-11 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dusk/40">🔍</span>
              </div>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="rounded-full border border-dusk/10 bg-white/80 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">{t("nav.allPrices")}</option>
                <option value="0-20">0 - 20 €</option>
                <option value="20-50">20 - 50 €</option>
                <option value="50-100">50 - 100 €</option>
                <option value="100-">100 € +</option>
              </select>

              <button
                type="submit"
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                {t("nav.search")}
              </button>
            </div>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
