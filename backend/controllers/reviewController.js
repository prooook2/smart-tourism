import Review from "../models/Review.js";
import Event from "../models/Event.js";

export const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const reviews = await Review.find({ event: eventId, isApproved: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du chargement des avis" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const existing = await Review.findOne({ event: eventId, user: userId });
    if (existing) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis" });
    }

    const review = await Review.create({ event: eventId, user: userId, rating, comment });
    const populated = await review.populate("user", "name email");

    // update event avg rating lightly (not persisted for now)
    res.status(201).json({ review: populated });
  } catch (err) {
    res.status(500).json({ message: "Impossible de créer l'avis" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });

    if (review.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    const populated = await review.populate("user", "name email");
    res.json({ review: populated });
  } catch (err) {
    res.status(500).json({ message: "Impossible de mettre à jour l'avis" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });

    if (review.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await review.deleteOne();
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Impossible de supprimer l'avis" });
  }
};
