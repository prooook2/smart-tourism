import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#fff0f0] to-[#ffe1ee] px-4">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/95 p-10 text-center shadow-2xl shadow-primary/20 backdrop-blur">
        <p className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
          Paiement interrompu
        </p>
        <h1 className="mt-6 text-3xl font-bold text-ink">Transaction annulée</h1>
        <p className="mt-4 text-dusk/70">
          Aucun débit n’a été effectué. Vous pouvez relancer le paiement ou contacter notre équipe si besoin.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/events"
            className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            Revenir aux expériences
          </Link>
          <Link
            to="/"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
