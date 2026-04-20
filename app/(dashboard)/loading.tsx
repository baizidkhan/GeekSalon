export default function Loading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-7 w-48 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
    </div>
  )
}
