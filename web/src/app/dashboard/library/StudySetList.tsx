import { StudySetEntity, StudySetSourceType } from "@/clean-architecture/domain/entities/study-set.entity";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { ClientStudySetList, StudySetWithCounts } from "@/app/dashboard/library/ClientStudySetList";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudySetListProps {
    studySets: StudySetEntity[];
    userId: string;
}

export async function StudySetList({
    studySets,
    userId,
}: StudySetListProps) {
    if (studySets.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    No study sets yet. Install the Chrome extension and start
                    watching YouTube to build your library.
                </p>
                <Button asChild variant="outline" size="sm" className="group">
                    <a
                        href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Get Chrome Extension
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </Button>
            </div>
        );
    }

    // Fetch counts for current study sets
    // For video-sourced study sets, use videoId to get counts
    const questionRepo = new DrizzleQuestionRepository();
    const flashcardRepo = new DrizzleFlashcardRepository();

    // Get video IDs from video-sourced study sets
    const videoIds = studySets
        .filter(s => s.videoId !== null)
        .map(s => s.videoId as number);

    const [questionCounts, flashcardCounts] = await Promise.all([
        videoIds.length > 0 ? questionRepo.countQuestionsByVideoIds(videoIds) : Promise.resolve({} as Record<number, number>),
        videoIds.length > 0 ? flashcardRepo.countFlashcardsByVideoIds(videoIds) : Promise.resolve({} as Record<number, number>),
    ]);

    const studySetsWithCounts: StudySetWithCounts[] = studySets.map(studySet => ({
        id: studySet.id,
        publicId: studySet.publicId,
        name: studySet.name,
        description: studySet.description,
        sourceType: studySet.sourceType,
        createdAt: studySet.createdAt,
        questionCount: studySet.videoId ? (questionCounts[studySet.videoId] ?? 0) : 0,
        flashcardCount: studySet.videoId ? (flashcardCounts[studySet.videoId] ?? 0) : 0,
    }));

    return (
        <ClientStudySetList studySets={studySetsWithCounts} />
    );
}
