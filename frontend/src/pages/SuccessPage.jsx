import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function SuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!sessionId || !token) {
      setStatus("missing");
      return;
    }

    const confirm = async () => {
      try {
        await axios.post(
          "http://localhost:5000/api/payments/confirm",
          { session_id: sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus("confirmed");
      } catch (err) {
        setStatus("failed");
        console.error("confirm payment error", err.response?.data || err.message);
      }
    };

    confirm();
  }, [sessionId]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#fff0f6] to-[#d4f6ff] px-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/95 p-10 text-center shadow-2xl shadow-primary/20 backdrop-blur">
        <p className="inline-flex items-center justify-center rounded-full border border-primary/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Paiement confirmé
        </p>
        <h1 className="mt-6 text-4xl font-bold text-ink">Merci pour votre confiance ✨</h1>
        <p className="mt-4 text-dusk/70">
          Votre réservation est finalisée. Vous recevrez un email récapitulatif avec toutes les informations pratiques.
        </p>

        {sessionId && (
          <div className="mt-8 rounded-2xl border border-dusk/10 bg-secondary p-4 text-sm text-dusk/70">
            Session Stripe : <span className="font-semibold text-ink">{sessionId}</span>
          </div>
        )}

        {status === "processing" && (
          <p className="mt-4 text-sm text-dusk/70">Validation de votre billet...</p>
        )}
        {status === "confirmed" && (
          <p className="mt-4 text-sm font-semibold text-green-600">
            Billet généré et email envoyé. Vérifiez votre boîte mail.
          </p>
        )}
        {status === "failed" && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            Impossible de confirmer l'envoi du billet. Si le paiement est débité, contactez le support.
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="/profile"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            Voir mon billet
          </a>
          <a
            href="/events"
            className="rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            Continuer à explorer
          </a>
        </div>
      </div>
    </section>
  );
}
