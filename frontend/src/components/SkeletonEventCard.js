// Skeleton card placeholder for EventList
export default function SkeletonEventCard() {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-pink-50 bg-white/95 shadow-lg shadow-primary/10 animate-pulse">
      <div className="h-48 w-full rounded-t-3xl bg-gradient-to-r from-dusk/10 to-primary/10" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="h-3 w-32 rounded bg-dusk/10" />
        <div className="h-6 w-3/4 rounded bg-dusk/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full rounded bg-dusk/10" />
          <div className="h-3 w-5/6 rounded bg-dusk/10" />
        </div>
        <div className="h-4 w-24 rounded bg-primary/10" />
      </div>
    </article>
  );
}
