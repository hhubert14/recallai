export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
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

            <main className="flex-1 container py-8 md:py-12 px-6 md:px-8 max-w-6xl mx-auto">
                <div className="space-y-8">
                    {/* Review Hero Card skeleton */}
                    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-6 w-40 rounded bg-muted animate-pulse" />
                                    <div className="h-4 w-64 rounded bg-muted animate-pulse" />
                                </div>
                            </div>
                            <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
                        </div>
                    </div>

                    {/* Quick Stats Row skeleton - 3 stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-border bg-card p-6"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-7 w-12 rounded bg-muted animate-pulse" />
                                        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* What's New + Recent Videos skeleton - 1/3 + 2/3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* What's New Card skeleton */}
                        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                                            <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                                        </div>
                                        <div className="h-5 w-36 rounded bg-muted animate-pulse" />
                                        <div className="h-4 w-full rounded bg-muted animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Videos Card skeleton */}
                        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                                    <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                                </div>
                                <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-lg"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="h-12 w-16 rounded bg-muted animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                                            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
