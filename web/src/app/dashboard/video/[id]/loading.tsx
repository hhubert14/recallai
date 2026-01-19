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
                {/* Title section */}
                <div className="mb-6">
                    <div className="h-9 w-96 max-w-full rounded bg-muted animate-pulse mb-3 mt-2" />
                    <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
                    {/* Video Player skeleton - Left Side */}
                    <div className="bg-muted rounded-xl overflow-hidden aspect-video lg:aspect-auto animate-pulse shadow-lg min-h-[300px] lg:min-h-0" />

                    {/* Content Tabs skeleton - Right Side */}
                    <div className="flex flex-col min-h-[500px] lg:min-h-0">
                        {/* Tabs header */}
                        <div className="flex gap-1 mb-4 border-b border-border pb-2">
                            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
                            <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
                            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
                        </div>

                        {/* Tab content skeleton */}
                        <div className="flex-1 rounded-xl border border-border bg-card p-6 space-y-4">
                            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                                <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
