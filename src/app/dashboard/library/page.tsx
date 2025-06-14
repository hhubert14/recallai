import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { createClient } from "@/lib/supabase/server";
import { getVideosByUserId } from "@/data-access/videos/get-videos-by-user-id";
import { LibraryVideoList } from "@/app/dashboard/library/LibraryVideoList";

export const metadata: Metadata = {
    title: "My Library | LearnSync",
    description: "Browse all your saved videos",
};

export default async function LibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get all user videos (no limit)
    const allVideos = await getVideosByUserId(user.id);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">LearnSync</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium text-blue-600"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-2">
                        My Library
                    </h1>
                    <p className="text-gray-500">
                        Browse all your saved videos and track your learning progress.
                    </p>
                </div>

                <LibraryVideoList videos={allVideos} userId={user.id} />
            </main>
        </div>
    );
}
