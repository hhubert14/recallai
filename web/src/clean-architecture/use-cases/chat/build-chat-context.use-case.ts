import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { ITranscriptWindowRepository } from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";

const TOP_K_WINDOWS = 3;

export type ChatContext = {
    videoTitle: string;
    summary: string;
    relevantTranscriptWindows: string[];
};

export class BuildChatContextUseCase {
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly summaryRepository: ISummaryRepository,
        private readonly transcriptWindowRepository: ITranscriptWindowRepository,
        private readonly embeddingService: IEmbeddingService
    ) {}

    async execute(
        userId: string,
        videoId: number,
        userMessage: string
    ): Promise<ChatContext> {
        // 1. Validate video ownership
        const video = await this.videoRepository.findVideoById(videoId);
        if (!video) {
            throw new Error("Video not found");
        }
        if (video.userId !== userId) {
            throw new Error("Not authorized to access this video");
        }

        // 2. Fetch summary
        const summary = await this.summaryRepository.findSummaryByVideoId(videoId);
        if (!summary) {
            throw new Error("Video summary not found. Please process the video first.");
        }

        // 3. Get relevant transcript windows via embedding similarity (RAG)
        let relevantTranscriptWindows: string[] = [];
        try {
            const queryEmbedding = await this.embeddingService.embed(userMessage);
            const windowMatches = await this.transcriptWindowRepository.findTopKSimilarWindows(
                videoId,
                queryEmbedding,
                TOP_K_WINDOWS
            );
            relevantTranscriptWindows = windowMatches.map((match) => match.window.text);
            console.log("Relevant windows: ", relevantTranscriptWindows)
        } catch {
            // Continue with empty context if embedding fails
            relevantTranscriptWindows = [];
        }

        return {
            videoTitle: video.title,
            summary: summary.content,
            relevantTranscriptWindows,
        };
    }
}
