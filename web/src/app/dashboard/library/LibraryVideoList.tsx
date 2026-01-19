import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { GetQuizCompletionStatusUseCase } from "@/clean-architecture/use-cases/user-stats/get-quiz-completion-status.use-case";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
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

    const useCase = new GetQuizCompletionStatusUseCase(new DrizzleQuestionRepository(), new DrizzleAnswerRepository())

    // Get quiz completion status for all videos
    const videosWithCompletion = await Promise.all(
        videos.map(async video => ({
            ...video,
            quizCompleted: await useCase.execute(userId, video.id),
        })),
    );
    return (
        <ClientLibraryVideoList videos={videosWithCompletion} />
    );
}
