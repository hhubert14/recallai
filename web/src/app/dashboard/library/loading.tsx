export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-background" role="status" aria-live="polite">
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

            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                {/* Page header with title and refresh button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-3">
                        <div className="h-10 w-40 rounded bg-muted animate-pulse" />
                        <div className="h-5 w-80 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-10 w-24 rounded-lg bg-muted animate-pulse" />
                </div>

                {/* Video list skeleton - single column */}
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-lg border border-border bg-card"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                {/* Left side - Video info */}
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-64 rounded bg-muted animate-pulse" />
                                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                                    </div>
                                </div>
                                {/* Right side - Date and counts */}
                                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                    <div className="text-right">
                                        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                                        <div className="flex items-center justify-end gap-3 mt-1">
                                            {/* Question count */}
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                                                <div className="h-3 w-4 rounded bg-muted animate-pulse" />
                                            </div>
                                            {/* Flashcard count */}
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                                                <div className="h-3 w-4 rounded bg-muted animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
