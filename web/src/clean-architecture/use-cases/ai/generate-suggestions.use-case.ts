import { extractYouTubeVideoId } from "@/lib/youtube";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { ITranscriptResolverService } from "@/clean-architecture/domain/services/transcript-resolver.interface";
import {
    ISuggestionGeneratorService,
    Suggestion,
    SuggestionItemType,
} from "@/clean-architecture/domain/services/suggestion-generator.interface";

const MIN_COUNT = 1;
const MAX_COUNT = 100;

export type GenerateSuggestionsInput = {
    studySetPublicId: string;
    userId: string;
    prompt: string;
    count: number;
    itemType: SuggestionItemType;
};

export type GenerateSuggestionsResult = {
    suggestions: Suggestion[];
};

export class GenerateSuggestionsUseCase {
    constructor(
        private readonly studySetRepository: IStudySetRepository,
        private readonly videoRepository: IVideoRepository,
        private readonly transcriptResolverService: ITranscriptResolverService,
        private readonly suggestionGeneratorService: ISuggestionGeneratorService
    ) {}

    async execute(input: GenerateSuggestionsInput): Promise<GenerateSuggestionsResult> {
        const { studySetPublicId, userId, prompt, count, itemType } = input;

        // Validate prompt
        if (!prompt || prompt.trim().length === 0) {
            throw new Error("Prompt is required");
        }

        // Validate count
        if (count < MIN_COUNT || count > MAX_COUNT) {
            throw new Error(`Count must be between ${MIN_COUNT} and ${MAX_COUNT}`);
        }

        // Find study set and verify ownership
        const studySet = await this.studySetRepository.findStudySetByPublicId(
            studySetPublicId
        );
        if (!studySet) {
            throw new Error("Study set not found");
        }
        if (studySet.userId !== userId) {
            throw new Error("Not authorized to access this study set");
        }

        // Prepare generation input based on study set type
        let title: string | undefined;
        let transcript: string | undefined;

        if (studySet.isVideoSourced() && studySet.videoId) {
            // Video-sourced: Get video details and transcript
            const video = await this.videoRepository.findVideoById(studySet.videoId);
            if (!video) {
                throw new Error("Video not found for this study set");
            }

            // Extract YouTube video ID from URL
            const youtubeVideoId = extractYouTubeVideoId(video.url);
            if (!youtubeVideoId) {
                throw new Error("Invalid video URL - could not extract video ID");
            }

            // Get transcript
            const transcriptResult = await this.transcriptResolverService.getTranscript(
                studySet.videoId,
                youtubeVideoId
            );

            title = video.title;
            transcript = transcriptResult.fullText;
        }
        // For manual study sets, title and transcript remain undefined

        // Generate suggestions (NOT persisted to database)
        const generated = await this.suggestionGeneratorService.generate({
            prompt: prompt.trim(),
            count,
            itemType,
            title,
            transcript,
        });

        if (!generated || generated.suggestions.length === 0) {
            throw new Error("Failed to generate suggestions");
        }

        return {
            suggestions: generated.suggestions,
        };
    }
}
