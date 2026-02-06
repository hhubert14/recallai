import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import { SummaryEntity } from "@/clean-architecture/domain/entities/summary.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

/**
 * Result type for finding study set content by video URL.
 * When exists is false, all content fields are null/empty.
 */
export type StudySetContentResult = {
  exists: boolean;
  studySet: StudySetEntity | null;
  video: VideoEntity | null;
  summary: SummaryEntity | null;
  questions: MultipleChoiceQuestionEntity[];
  flashcards: FlashcardEntity[];
};

/**
 * Finds all study set content for a video by its URL.
 * Used by the Chrome extension side panel to display content.
 *
 * Returns exists: false if the video hasn't been processed by the user.
 * Returns exists: true with all available content if the video exists.
 */
export class FindStudySetByVideoUrlUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly studySetRepository: IStudySetRepository,
    private readonly summaryRepository: ISummaryRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly flashcardRepository: IFlashcardRepository
  ) {}

  async execute(
    userId: string,
    videoUrl: string
  ): Promise<StudySetContentResult> {
    // Find the video by user ID and URL
    const video = await this.videoRepository.findVideoByUserIdAndUrl(
      userId,
      videoUrl
    );

    // If video doesn't exist, return not found result
    if (!video) {
      return {
        exists: false,
        studySet: null,
        video: null,
        summary: null,
        questions: [],
        flashcards: [],
      };
    }

    // Video exists - fetch all related content in parallel
    const [studySet, summary, questions, flashcards] = await Promise.all([
      this.studySetRepository.findStudySetByVideoId(video.id),
      this.summaryRepository.findSummaryByVideoId(video.id),
      this.questionRepository.findQuestionsByVideoId(video.id),
      this.flashcardRepository.findFlashcardsByVideoId(video.id),
    ]);

    return {
      exists: true,
      studySet,
      video,
      summary,
      questions,
      flashcards,
    };
  }
}
