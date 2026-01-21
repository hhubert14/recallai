import { extractYouTubeVideoId } from "@/lib/youtube";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { ITranscriptWindowRepository } from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import { IQuestionGeneratorService } from "@/clean-architecture/domain/services/question-generator.interface";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { logger } from "@/lib/logger";

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
        private readonly transcriptResolverService: ITranscriptResolverService,
        private readonly questionGeneratorService: IQuestionGeneratorService,
        private readonly embeddingService: IEmbeddingService,
        private readonly transcriptWindowRepository: ITranscriptWindowRepository
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

        // Get transcript (DB first, then fallback to YouTube API)
        const transcriptResult = await this.transcriptResolverService.getTranscript(videoId, youtubeVideoId);

        // Extract existing question texts to avoid duplicates
        const existingQuestionTexts = existingQuestions.map(q => q.questionText);

        // Generate questions using full text (timestamps will be used when available)
        const generatedQuestions = await this.questionGeneratorService.generate(
            video.title,
            transcriptResult.fullText,
            count,
            existingQuestionTexts
        );

        if (!generatedQuestions || generatedQuestions.questions.length === 0) {
            throw new Error("Failed to generate questions");
        }

        // Save questions to database with matched timestamps
        const savedQuestions: MultipleChoiceQuestionEntity[] = [];
        for (const q of generatedQuestions.questions) {
            const options = q.options.map((optionText, index) => ({
                optionText,
                isCorrect: index === q.correctAnswerIndex,
                explanation:
                    index === q.correctAnswerIndex ? q.explanation : null,
            }));

            let sourceTimestamp: number | null = null;
            try {
                const quoteEmbedding = await this.embeddingService.embed(q.sourceQuote);
                const match = await this.transcriptWindowRepository.findMostSimilarWindow(videoId, quoteEmbedding);
                if (match) {
                    sourceTimestamp = match.window.startTime;
                    logger.video.info(
                        `Matched quote to timestamp ${sourceTimestamp}s (similarity: ${match.similarity.toFixed(3)})`
                    );
                }
            } catch (error) {
                logger.video.warn(
                    `Failed to match source quote to timestamp: ${error}`
                );
            }

            const savedQuestion =
                await this.questionRepository.createMultipleChoiceQuestion(
                    videoId,
                    q.question,
                    options,
                    q.sourceQuote,
                    sourceTimestamp
                );
            savedQuestions.push(savedQuestion);
        }

        return {
            questions: savedQuestions,
            total: existingCount + savedQuestions.length,
        };
    }
}
