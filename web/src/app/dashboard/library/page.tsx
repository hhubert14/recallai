import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TextRefreshButton } from "../TextRefreshButton";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleFolderRepository } from "@/clean-architecture/infrastructure/repositories/folder.repository.drizzle";
import { DrizzleReviewableItemRepository } from "@/clean-architecture/infrastructure/repositories/reviewable-item.repository.drizzle";
import { FindStudySetsByUserIdUseCase } from "@/clean-architecture/use-cases/study-set/find-study-sets-by-user-id.use-case";
import { GetFoldersByUserIdUseCase } from "@/clean-architecture/use-cases/folder/get-folders-by-user-id.use-case";
import { GetFolderWithStudySetsUseCase } from "@/clean-architecture/use-cases/folder/get-folder-with-study-sets.use-case";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LibraryClientWrapper } from "./LibraryClientWrapper";
import { StudySetWithCounts } from "./ClientStudySetList";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "My Library | RecallAI",
    description: "Browse all your study sets",
};

interface LibraryPageProps {
    searchParams: Promise<{ folder?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if user is not authenticated
    if (!user) {
        redirect("/auth/login");
    }

    const { folder: folderIdParam } = await searchParams;
    const folderId = folderIdParam ? parseInt(folderIdParam, 10) : null;

    // Redirect if folder param exists but is invalid (non-numeric)
    if (folderIdParam && (folderId === null || isNaN(folderId))) {
        redirect("/dashboard/library");
    }

    const folderRepo = new DrizzleFolderRepository();
    const studySetRepo = new DrizzleStudySetRepository();

    // Fetch folders with study set counts
    const foldersUseCase = new GetFoldersByUserIdUseCase(folderRepo);
    const userFolders = await foldersUseCase.execute(user.id);

    // Get study set counts for each folder
    const foldersWithCounts = await Promise.all(
        userFolders.map(async (folder) => {
            const studySetIds = await folderRepo.findStudySetIdsByFolderId(folder.id);
            return {
                id: folder.id,
                name: folder.name,
                description: folder.description,
                createdAt: folder.createdAt,
                updatedAt: folder.updatedAt,
                studySetCount: studySetIds.length,
            };
        })
    );

    // If viewing a specific folder, get its study sets
    let studySets;
    let currentFolder = null;

    if (folderId && !isNaN(folderId)) {
        const folderWithStudySetsUseCase = new GetFolderWithStudySetsUseCase(
            folderRepo,
            studySetRepo
        );
        const result = await folderWithStudySetsUseCase.execute({
            folderId,
            userId: user.id,
        });

        if (result) {
            currentFolder = result.folder;
            studySets = result.studySets;
        } else {
            // Folder not found or doesn't belong to user, redirect to library
            redirect("/dashboard/library");
        }
    } else {
        // Get all user study sets
        studySets = await new FindStudySetsByUserIdUseCase(studySetRepo).execute(user.id);
    }

    // Fetch counts for study sets using reviewable items
    const reviewableItemRepo = new DrizzleReviewableItemRepository();
    const studySetIds = studySets.map((s) => s.id);
    const itemCounts = await reviewableItemRepo.countItemsByStudySetIdsBatch(studySetIds);

    const studySetsWithCounts: StudySetWithCounts[] = studySets.map(
        (studySet) => ({
            id: studySet.id,
            publicId: studySet.publicId,
            name: studySet.name,
            description: studySet.description,
            sourceType: studySet.sourceType,
            createdAt: studySet.createdAt,
            questionCount: itemCounts[studySet.id]?.questions ?? 0,
            flashcardCount: itemCounts[studySet.id]?.flashcards ?? 0,
        })
    );

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <DashboardHeader />

            <main className="flex-1 container py-12 px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {currentFolder ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="mb-2 -ml-2 text-muted-foreground"
                                >
                                    <Link href="/dashboard/library">
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back to Library
                                    </Link>
                                </Button>
                                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                                    {currentFolder.name}
                                </h1>
                                {currentFolder.description && (
                                    <p className="text-lg text-muted-foreground">
                                        {currentFolder.description}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                                    My Library
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Browse all your study sets and track your learning
                                    progress.
                                </p>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-3">
                            <TextRefreshButton />
                        </div>
                    </div>
                </div>

                <LibraryClientWrapper
                    folders={foldersWithCounts}
                    studySets={studySetsWithCounts}
                    isViewingFolder={!!currentFolder}
                />
            </main>
        </div>
    );
}
