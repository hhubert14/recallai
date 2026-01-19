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

            <main className="flex-1 container py-4 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6 mt-2 space-y-3">
                    <div className="h-10 w-56 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-96 rounded bg-muted animate-pulse" />
                </div>

                {/* Stats bar skeleton - 4 colored stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <div className="h-8 w-8 rounded bg-muted animate-pulse mb-1" />
                        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <div className="h-8 w-8 rounded bg-muted animate-pulse mb-1" />
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                        <div className="h-8 w-8 rounded bg-muted animate-pulse mb-1" />
                        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <div className="h-8 w-8 rounded bg-muted animate-pulse mb-1" />
                        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </div>
                </div>

                {/* Review card skeleton */}
                <div className="rounded-xl bg-card border border-border p-6 space-y-6">
                    {/* Question skeleton */}
                    <div className="space-y-3">
                        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                        <div className="h-6 w-full rounded bg-muted animate-pulse" />
                        <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
                    </div>

                    {/* Options skeleton */}
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-14 rounded-lg bg-muted animate-pulse"
                                style={{ animationDelay: `${i * 100}ms` }}
                            />
                        ))}
                    </div>

                    {/* Button skeleton */}
                    <div className="flex justify-end">
                        <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
                    </div>
                </div>
            </main>
        </div>
    );
}
