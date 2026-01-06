import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-br from-[#0f172a] via-[#0b1221] to-[#0a0f1c] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold tracking-tight">Smart Tourism</h3>
          <p className="max-w-md text-sm text-slate-300">
            Découvrez, réservez et partagez les meilleures expériences culturelles
            et touristiques autour de vous.
          </p>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Smart Tourism. Tous droits réservés.</p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Explorer</h4>
            <nav className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/events" className="hover:text-white">Événements</Link>
              <Link to="/recommend" className="hover:text-white">Recommandés</Link>
              <Link to="/" className="hover:text-white">Accueil</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Compte</h4>
            <nav className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/login" className="hover:text-white">Connexion</Link>
              <Link to="/register" className="hover:text-white">Inscription</Link>
              <Link to="/profile" className="hover:text-white">Profil</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <a href="mailto:a.b23466882@gmail.com" className="hover:text-white">a.b23466882@gmail.com</a>
              <a href="tel:+33123456789" className="hover:text-white">+216 20 442 024</a>
              <div className="flex gap-3 pt-1 text-base">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="Twitter">𝕏</a>
                <a href="https://instagram.com/azizbenslema" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="Instagram">IG</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white" aria-label="LinkedIn">in</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
