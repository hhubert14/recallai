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

            <main className="flex-1 container py-8 px-6 md:px-8 max-w-7xl mx-auto">
                {/* Page title */}
                <div className="mb-8 text-center">
                    <div className="h-9 w-32 mx-auto rounded bg-muted animate-pulse mb-2" />
                    <div className="h-5 w-72 mx-auto rounded bg-muted animate-pulse" />
                </div>

                {/* Study mode selector skeleton */}
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Hero message */}
                    <div className="text-center">
                        <div className="h-8 w-64 mx-auto rounded bg-muted animate-pulse" />
                    </div>

                    {/* Mode cards */}
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full p-4 rounded-xl border-2 border-border bg-card flex items-center gap-4"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* Radio indicator */}
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50 shrink-0" />
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                                        <div className="h-4 w-8 rounded bg-muted animate-pulse" />
                                    </div>
                                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                                </div>
                                {/* Arrow */}
                                <div className="w-5 h-5 rounded bg-muted animate-pulse shrink-0" />
                            </div>
                        ))}
                    </div>

                    {/* Start button */}
                    <div className="flex justify-center">
                        <div className="h-11 w-36 rounded-lg bg-muted animate-pulse" />
                    </div>

                    {/* Progress footer */}
                    <div className="text-center border-t border-border pt-6">
                        <div className="h-4 w-64 mx-auto rounded bg-muted animate-pulse" />
                    </div>
                </div>
            </main>
        </div>
    );
}
