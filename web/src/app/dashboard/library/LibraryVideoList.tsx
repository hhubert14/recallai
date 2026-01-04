import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { GetQuizCompletionStatusUseCase } from "@/clean-architecture/use-cases/user-stats/get-quiz-completion-status.use-case";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { ClientLibraryVideoList } from "@/app/dashboard/library/ClientLibraryVideoList";

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
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No videos in your library yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start watching educational videos with the RecallAI
                        extension to build your library.
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                        Install the Chrome extension to get started
                    </div>
                </div>
            </div>
        );
    }

    // Get quiz completion status for all videos
    const videosWithCompletion = await Promise.all(
        videos.map(async video => ({
            ...video,
            quizCompleted: await new GetQuizCompletionStatusUseCase(
                new DrizzleQuestionRepository(),
                new DrizzleAnswerRepository(),
            ).execute(userId, video.id),
        })),
    );
    return (
        <ClientLibraryVideoList videos={videosWithCompletion} />
    );
}
