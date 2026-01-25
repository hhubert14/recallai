import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryStudySetList } from "@/app/dashboard/library/LibraryStudySetList";
import { TextRefreshButton } from "../TextRefreshButton";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { FindStudySetsByUserIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-sets-by-user-id.use-case";
import { DashboardHeader } from "@/components/DashboardHeader";

export const metadata: Metadata = {
    title: "My Library | RecallAI",
    description: "Browse all your study sets",
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

    // Get all user study sets
    const allStudySets = await new FindStudySetsByUserIdUseCase(new DrizzleStudySetRepository()).execute(user.id);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader />

            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                            My Library
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Browse all your study sets and track your learning
                            progress.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-3">
                            <TextRefreshButton />
                        </div>
                    </div>
                </div>

                <LibraryStudySetList studySets={allStudySets} userId={user.id} />
            </main>
        </div>
    );
}
