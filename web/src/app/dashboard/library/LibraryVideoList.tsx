import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { ClientLibraryVideoList } from "@/app/dashboard/library/ClientLibraryVideoList";
import { Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryVideoListProps {
    videos: VideoEntity[];
    userId: string;
}

export async function LibraryVideoList({
    videos,
    userId,
}: LibraryVideoListProps) {
    if (videos.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    No videos yet. Install the Chrome extension and start
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

    // Fetch counts for current videos only (SQL aggregation)
    const questionRepo = new DrizzleQuestionRepository();
    const flashcardRepo = new DrizzleFlashcardRepository();

    const videoIds = videos.map(v => v.id);
    const [questionCounts, flashcardCounts] = await Promise.all([
        questionRepo.countQuestionsByVideoIds(videoIds),
        flashcardRepo.countFlashcardsByVideoIds(videoIds),
    ]);

    const videosWithCounts = videos.map(video => ({
        ...video,
        questionCount: questionCounts[video.id] ?? 0,
        flashcardCount: flashcardCounts[video.id] ?? 0,
    }));

    return (
        <ClientLibraryVideoList videos={videosWithCounts} />
    );
}
