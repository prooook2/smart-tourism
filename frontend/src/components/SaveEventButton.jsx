import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

export default function SaveEventButton({ eventId }) {
  const [isSaved, setIsSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user._id) return;
    const saved = JSON.parse(localStorage.getItem(`saved-events-${user._id}`) || "[]");
    setIsSaved(saved.includes(eventId));
  }, [eventId, user._id]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user._id) return;

    const key = `saved-events-${user._id}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const next = isSaved ? saved.filter((id) => id !== eventId) : [...saved, eventId];
    localStorage.setItem(key, JSON.stringify(next));
    setIsSaved(!isSaved);
  };

  return (
    <button
      onClick={toggleSave}
      className="rounded-full p-2 transition hover:bg-primary/10"
      aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <FaHeart className={`text-lg transition ${isSaved ? "text-red-500" : "text-gray-300 hover:text-red-500"}`} />
    </button>
  );
}
