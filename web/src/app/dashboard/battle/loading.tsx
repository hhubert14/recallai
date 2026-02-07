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

      <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <div className="h-10 w-32 rounded bg-muted animate-pulse mb-3" />
          <div className="h-5 w-72 rounded bg-muted animate-pulse" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-6">
          <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
        </div>

        {/* Room cards grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="h-4 w-10 rounded bg-muted animate-pulse" />
                <div className="h-4 w-14 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-16 rounded bg-muted animate-pulse self-end ml-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
