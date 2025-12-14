import { extractYouTubeVideoId } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IVideoTranscriptService } from "@/clean-architecture/domain/services/video-transcript.interface";
import { IQuestionGeneratorService } from "@/clean-architecture/domain/services/question-generator.interface";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

const MAX_QUESTIONS_PER_VIDEO = 20;
const VALID_COUNTS = [5, 10, 20] as const;
type ValidCount = (typeof VALID_COUNTS)[number];

export type GenerateMultipleChoiceQuestionsResult = {
    questions: MultipleChoiceQuestionEntity[];
    total: number;
};

export class GenerateMultipleChoiceQuestionsUseCase {
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly questionRepository: IQuestionRepository,
        private readonly videoTranscriptService: IVideoTranscriptService,
        private readonly questionGeneratorService: IQuestionGeneratorService
    ) {}

    async execute(
        userId: string,
        videoId: number,
        count: number
    ): Promise<GenerateMultipleChoiceQuestionsResult> {
        // Validate count
        if (!VALID_COUNTS.includes(count as ValidCount)) {
            throw new Error(
                `Invalid count: ${count}. Must be one of: ${VALID_COUNTS.join(", ")}`
            );
        }

        // Fetch video and verify ownership
        const video = await this.videoRepository.findVideoById(videoId);
        if (!video) {
            throw new Error("Video not found");
        }
        if (video.userId !== userId) {
            throw new Error("Not authorized to access this video");
        }

        // Check current question count against cap
        const existingQuestions =
            await this.questionRepository.findQuestionsByVideoId(videoId);
        const existingCount = existingQuestions.length;

        if (existingCount >= MAX_QUESTIONS_PER_VIDEO) {
            throw new Error(
                `Maximum questions reached (${MAX_QUESTIONS_PER_VIDEO}). Delete some to generate more.`
            );
        }

        const remainingCapacity = MAX_QUESTIONS_PER_VIDEO - existingCount;
        if (count > remainingCapacity) {
            throw new Error(
                `Cannot generate ${count} questions. Only ${remainingCapacity} more allowed (${existingCount} of ${MAX_QUESTIONS_PER_VIDEO} max).`
            );
        }

        // Extract YouTube video ID from URL
        const youtubeVideoId = extractYouTubeVideoId(video.url);
        if (!youtubeVideoId) {
            throw new Error("Invalid video URL - could not extract video ID");
        }

        // Fetch transcript
        const transcript =
            await this.videoTranscriptService.get(youtubeVideoId);
        if (!transcript) {
            throw new Error(
                "Failed to fetch video transcript - captions may be disabled"
            );
        }

        // Generate questions
        const generatedQuestions = await this.questionGeneratorService.generate(
            video.title,
            transcript,
            count
        );

        if (!generatedQuestions || generatedQuestions.questions.length === 0) {
            throw new Error("Failed to generate questions");
        }

        // Save questions to database
        const savedQuestions: MultipleChoiceQuestionEntity[] = [];
        for (const q of generatedQuestions.questions) {
            const options = q.options.map((optionText, index) => ({
                optionText,
                isCorrect: index === q.correctAnswerIndex,
                orderIndex: index,
                explanation:
                    index === q.correctAnswerIndex ? q.explanation : null,
            }));

            const savedQuestion =
                await this.questionRepository.createMultipleChoiceQuestion(
                    videoId,
                    q.question,
                    options
                );
            savedQuestions.push(savedQuestion);
        }

        return {
            questions: savedQuestions,
            total: existingCount + savedQuestions.length,
        };
    }
}
