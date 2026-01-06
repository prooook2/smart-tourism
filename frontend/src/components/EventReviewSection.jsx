import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import Spinner from "./Spinner";

export default function EventReviewSection({ eventId, isRegistered }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/event/${eventId}`);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
      } catch (err) {
        console.error("Load reviews error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/reviews/event/${eventId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([res.data.review, ...reviews]);
      setComment("");
      setRating(5);
      const newAvg = (reviews.reduce((s, r) => s + r.rating, 0) + rating) / (reviews.length + 1);
      setAvgRating(newAvg);
      toast.success("Avis publié !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la publication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const next = reviews.filter((r) => r._id !== reviewId);
      setReviews(next);
      const newAvg = next.length ? next.reduce((s, r) => s + r.rating, 0) / next.length : 0;
      setAvgRating(newAvg);
      toast.success("Avis supprimé");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="rounded-3xl border border-pink-50 bg-white/95 p-8 shadow-lg shadow-primary/10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Avis & Commentaires</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">Évaluations ({reviews.length})</h3>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-lg ${i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-dusk">
          {avgRating.toFixed(1)} / 5.0 ({reviews.length} avis)
        </span>
      </div>

      {token && isRegistered && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dusk">Votre évaluation</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Note ${num}`}
                >
                  <FaStar
                    className={`text-2xl ${
                      num <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-dusk">
              Votre commentaire
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="mt-2 w-full rounded-lg border border-dusk/20 bg-dusk/5 px-4 py-3 text-dusk placeholder:text-dusk/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              rows="4"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Publication..." : "Publier mon avis"}
          </button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="rounded-xl border border-dusk/10 bg-secondary/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">{review.user?.name || "Utilisateur"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-dusk/60">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {token && (user._id === review.user?._id || user.role === "admin") && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-xs text-red-500 transition hover:text-red-700"
                    aria-label="Supprimer cet avis"
                  >
                    ✕
                  </button>
                )}
              </div>

              <p className="mt-2 text-sm text-dusk/80">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-dusk/60">
            Aucun avis pour le moment. Soyez le premier à partager votre expérience !
          </p>
        )}
      </div>
    </div>
  );
}
