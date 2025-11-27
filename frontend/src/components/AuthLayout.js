const defaultHighlights = [
  { value: "450+", label: "Événements animés" },
  { value: "38k", label: "Voyageurs confiants" },
  { value: "120", label: "Destinations premium" },
];

const AuthLayout = ({ title, subtitle, badge = "Smart Tourism", children, sideContent }) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-[#fff0f6] to-[#ffd6e8] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:block">
          {sideContent || (
            <div className="relative overflow-hidden rounded-[40px] bg-ink text-white p-10 shadow-2xl shadow-primary/40">
              <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Expériences sur-mesure</p>
                <h2 className="mt-6 text-4xl font-semibold leading-tight">
                  Inspirez les voyageurs
                  <br /> avec un design haut de gamme.
                </h2>
                <p className="mt-4 text-white/70">
                  Des parcours immersifs, une communauté engagée et des outils fiables pour transformer vos projets en
                  souvenirs mémorables.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                  {defaultHighlights.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 p-4">
                      <p className="text-2xl font-semibold text-primary">{item.value}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-2xl shadow-primary/20 backdrop-blur">
          {badge && (
            <p className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {badge}
            </p>
          )}
          <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-4 text-base text-dusk/80">{subtitle}</p>}

          <div className="mt-8 space-y-6">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;

