export default function StoreLoading() {
  return (
    <div className="container-raxie py-8 md:py-12 space-y-10 animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full h-[400px] md:h-[500px] bg-muted/60 rounded-3xl" />

      {/* Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/60 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted/50 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
