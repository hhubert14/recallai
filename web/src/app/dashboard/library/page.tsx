import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryVideoList } from "@/app/dashboard/library/LibraryVideoList";
import { TextRefreshButton } from "../TextRefreshButton";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { FindVideosByUserIdUseCase } from "@/clean-architecture/use-cases/video/find-videos-by-user-id.use-case";

export const metadata: Metadata = {
    title: "My Library | RecallAI",
    description: "Browse all your saved videos",
};

export default async function LibraryPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if user is not authenticated
    if (!user) {
        redirect("/auth/login");
    }

    // Get all user videos
    const allVideos = await new FindVideosByUserIdUseCase(new DrizzleVideoRepository()).execute(user.id);

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100 mb-3">
                            My Library
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Browse all your saved videos and track your learning
                            progress.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-3">
                            <TextRefreshButton />
                        </div>
                    </div>
                </div>

                <LibraryVideoList videos={allVideos} userId={user.id} />
            </main>
        </div>
    );
}
