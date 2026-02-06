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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          </div>
          {/* Nav links */}
          <div className="hidden md:flex gap-6">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-10 md:px-20 lg:px-24 max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Title section */}
          <div className="mb-6">
            <div className="h-9 w-96 max-w-full rounded bg-muted animate-pulse mb-3 mt-2" />
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          </div>

          {/* Video Player skeleton - Full width at top */}
          <div className="bg-muted rounded-xl overflow-hidden aspect-video animate-pulse shadow-lg max-w-4xl" />

          {/* Collapsible Summary skeleton */}
          <div className="border border-border rounded-lg bg-card">
            <div className="flex items-center justify-between p-4">
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            </div>
          </div>

          {/* Terms List skeleton */}
          <section className="space-y-4">
            {/* Progress Overview skeleton */}
            <div className="border border-border rounded-lg bg-card p-4">
              <div className="h-4 w-16 rounded bg-muted animate-pulse mb-3" />
              <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
              <div className="flex items-center gap-6 mt-3">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>

            {/* Terms header */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded bg-muted animate-pulse" />
              <div className="h-9 w-24 rounded bg-muted animate-pulse" />
            </div>
            {/* Term cards */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex border border-border rounded-lg bg-card overflow-hidden"
                >
                  <div className="flex-1 p-4 border-r border-border">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
