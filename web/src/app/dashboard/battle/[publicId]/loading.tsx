export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          </div>
          <div className="hidden md:flex gap-6">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-4 w-14 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 px-6 md:px-8 max-w-4xl mx-auto space-y-8">
        {/* Room header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
          </div>
        </div>

        {/* Slots grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* Start button */}
        <div className="flex justify-center">
          <div className="h-11 w-36 rounded-md bg-muted animate-pulse" />
        </div>
      </main>
    </div>
  );
}
