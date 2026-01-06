// Reusable spinner component
export default function Spinner({ size = "md", label = "Chargement..." }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-primary/20 border-t-primary`}
        role="status"
        aria-label={label}
      />
      {label && <p className="text-sm text-dusk/60">{label}</p>}
    </div>
  );
}
