import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { IReviewProgressRepository } from "@/clean-architecture/domain/repositories/review-progress.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";
import {
  StudyMode,
  ItemTypeFilter,
  ReviewItem,
  ReviewItemContent,
} from "./types";

export type GetItemsParams = {
  mode: StudyMode;
  itemType?: ItemTypeFilter;
  studySetId?: number;
};

export class GetItemsForReviewUseCase {
  constructor(
    private reviewableItemRepository: IReviewableItemRepository,
    private reviewProgressRepository: IReviewProgressRepository,
    private questionRepository: IQuestionRepository,
    private flashcardRepository: IFlashcardRepository,
    private videoRepository: IVideoRepository,
    private studySetRepository: IStudySetRepository
  ) {}

  async execute(
    userId: string,
    params: GetItemsParams = { mode: "due" },
    limit?: number
  ): Promise<ReviewItem[]> {
    const itemType = params.itemType ?? "all";
    const studySetId = params.studySetId;

    switch (params.mode) {
      case "due":
        return this.getDueItems(userId, itemType, limit, studySetId);
      case "new":
        return this.getNewItems(userId, itemType, limit, studySetId);
      case "random":
        return this.getRandomItems(userId, itemType, limit, studySetId);
      default:
        return this.getDueItems(userId, itemType, limit, studySetId);
    }
  }

  private async getDueItems(
    userId: string,
    itemType: ItemTypeFilter,
    limit?: number,
    studySetId?: number
  ): Promise<ReviewItem[]> {
    // Get all progress records that are due
    let progressRecords =
      await this.reviewProgressRepository.findReviewProgressDueForReview(
        userId
      );

    if (progressRecords.length === 0) {
      return [];
    }

    // Sort by box level (lowest first - struggling items get priority)
    progressRecords.sort((a, b) => a.boxLevel - b.boxLevel);

    // Apply limit if specified
    if (limit && progressRecords.length > limit) {
      progressRecords = progressRecords.slice(0, limit);
    }

    // Get the reviewable items
    const reviewableItemIds = progressRecords.map((p) => p.reviewableItemId);
    let reviewableItems =
      await this.reviewableItemRepository.findReviewableItemsByIds(
        reviewableItemIds
      );

    // Filter by study set if specified
    if (studySetId !== undefined) {
      reviewableItems = reviewableItems.filter(
        (item) => item.studySetId === studySetId
      );
      // Also filter progress to match
      const filteredItemIds = new Set(reviewableItems.map((item) => item.id));
      progressRecords = progressRecords.filter((p) =>
        filteredItemIds.has(p.reviewableItemId)
      );
    }

    // Filter by item type if needed
    if (itemType !== "all") {
      reviewableItems = reviewableItems.filter(
        (item) => item.itemType === itemType
      );
      // Also filter progress to match
      const filteredItemIds = new Set(reviewableItems.map((item) => item.id));
      progressRecords = progressRecords.filter((p) =>
        filteredItemIds.has(p.reviewableItemId)
      );
    }

    // Fetch content, videos, and study sets
    const { questions, flashcards, videos, studySets } =
      await this.fetchContentAndVideosAndStudySets(reviewableItems);

    // Build the result
    return this.buildReviewItems(
      reviewableItems,
      progressRecords,
      questions,
      flashcards,
      videos,
      studySets
    );
  }

  private async getNewItems(
    userId: string,
    itemType: ItemTypeFilter,
    limit?: number,
    studySetId?: number
  ): Promise<ReviewItem[]> {
    // Get all reviewable items for the user (filtered by study set if provided)
    let allReviewableItems =
      studySetId !== undefined
        ? await this.reviewableItemRepository.findReviewableItemsByUserIdAndStudySetId(
            userId,
            studySetId
          )
        : await this.reviewableItemRepository.findReviewableItemsByUserId(
            userId
          );

    if (allReviewableItems.length === 0) {
      return [];
    }

    // Filter by item type if needed
    if (itemType !== "all") {
      allReviewableItems = allReviewableItems.filter(
        (item) => item.itemType === itemType
      );
    }

    // Find which ones don't have progress
    const allItemIds = allReviewableItems.map((item) => item.id);
    const itemIdsWithoutProgress =
      await this.reviewProgressRepository.findReviewableItemIdsWithoutProgress(
        userId,
        allItemIds
      );

    if (itemIdsWithoutProgress.length === 0) {
      return [];
    }

    // Apply limit
    let limitedIds = itemIdsWithoutProgress;
    if (limit && limitedIds.length > limit) {
      limitedIds = limitedIds.slice(0, limit);
    }

    // Get the actual reviewable items
    const newReviewableItems =
      await this.reviewableItemRepository.findReviewableItemsByIds(limitedIds);

    // Fetch content, videos, and study sets
    const { questions, flashcards, videos, studySets } =
      await this.fetchContentAndVideosAndStudySets(newReviewableItems);

    // Build the result (no progress for new items)
    return this.buildReviewItems(
      newReviewableItems,
      [],
      questions,
      flashcards,
      videos,
      studySets
    );
  }

  private async getRandomItems(
    userId: string,
    itemType: ItemTypeFilter,
    limit?: number,
    studySetId?: number
  ): Promise<ReviewItem[]> {
    // Get all reviewable items for the user (filtered by study set if provided)
    let allReviewableItems =
      studySetId !== undefined
        ? await this.reviewableItemRepository.findReviewableItemsByUserIdAndStudySetId(
            userId,
            studySetId
          )
        : await this.reviewableItemRepository.findReviewableItemsByUserId(
            userId
          );

    if (allReviewableItems.length === 0) {
      return [];
    }

    // Filter by item type if needed
    if (itemType !== "all") {
      allReviewableItems = allReviewableItems.filter(
        (item) => item.itemType === itemType
      );
    }

    // Shuffle items for randomness
    let shuffledItems = this.shuffleArray([...allReviewableItems]);

    // Apply limit if specified
    if (limit && shuffledItems.length > limit) {
      shuffledItems = shuffledItems.slice(0, limit);
    }

    // Get progress for these items
    const itemIds = shuffledItems.map((item) => item.id);
    const progressRecords =
      await this.reviewProgressRepository.findReviewProgressByReviewableItemIds(
        userId,
        itemIds
      );

    // Fetch content, videos, and study sets
    const { questions, flashcards, videos, studySets } =
      await this.fetchContentAndVideosAndStudySets(shuffledItems);

    // Build the result
    return this.buildReviewItems(
      shuffledItems,
      progressRecords,
      questions,
      flashcards,
      videos,
      studySets
    );
  }

  private async fetchContentAndVideosAndStudySets(
    reviewableItems: ReviewableItemEntity[]
  ): Promise<{
    questions: MultipleChoiceQuestionEntity[];
    flashcards: FlashcardEntity[];
    videos: VideoEntity[];
    studySets: StudySetEntity[];
  }> {
    // Separate question and flashcard IDs
    const questionIds: number[] = [];
    const flashcardIds: number[] = [];
    const videoIds = new Set<number>();
    const studySetIds = new Set<number>();

    for (const item of reviewableItems) {
      if (item.itemType === "question" && item.questionId) {
        questionIds.push(item.questionId);
      } else if (item.itemType === "flashcard" && item.flashcardId) {
        flashcardIds.push(item.flashcardId);
      }
      if (item.videoId !== null) {
        videoIds.add(item.videoId);
      }
      studySetIds.add(item.studySetId);
    }

    // Fetch in parallel
    const [questions, flashcards, videos, studySets] = await Promise.all([
      questionIds.length > 0
        ? this.questionRepository.findQuestionsByIds(questionIds)
        : Promise.resolve([]),
      flashcardIds.length > 0
        ? this.flashcardRepository.findFlashcardsByIds(flashcardIds)
        : Promise.resolve([]),
      this.videoRepository.findVideosByIds(Array.from(videoIds)),
      this.studySetRepository.findStudySetsByIds(Array.from(studySetIds)),
    ]);

    return { questions, flashcards, videos, studySets };
  }

  private buildReviewItems(
    reviewableItems: ReviewableItemEntity[],
    progressRecords: ReviewProgressEntity[],
    questions: MultipleChoiceQuestionEntity[],
    flashcards: FlashcardEntity[],
    videos: VideoEntity[],
    studySets: StudySetEntity[]
  ): ReviewItem[] {
    // Create lookup maps
    const progressByItemId = new Map(
      progressRecords.map((p) => [p.reviewableItemId, p])
    );
    const questionById = new Map(questions.map((q) => [q.id, q]));
    const flashcardById = new Map(flashcards.map((f) => [f.id, f]));
    const videoById = new Map(videos.map((v) => [v.id, v]));
    const studySetById = new Map(studySets.map((s) => [s.id, s]));

    const result: ReviewItem[] = [];

    for (const item of reviewableItems) {
      const progress = progressByItemId.get(item.id) ?? null;
      const video =
        item.videoId !== null ? videoById.get(item.videoId) : undefined;
      const studySet = studySetById.get(item.studySetId);

      // Study set is required
      if (!studySet) continue;

      let content: ReviewItemContent;

      if (item.itemType === "question" && item.questionId) {
        const question = questionById.get(item.questionId);
        if (!question) continue;
        content = { type: "question", data: question };
      } else if (item.itemType === "flashcard" && item.flashcardId) {
        const flashcard = flashcardById.get(item.flashcardId);
        if (!flashcard) continue;
        content = { type: "flashcard", data: flashcard };
      } else {
        continue;
      }

      result.push({
        reviewableItem: item,
        progress,
        content,
        video: video
          ? {
              id: video.id,
              title: video.title,
            }
          : null,
        studySet: {
          id: studySet.id,
          publicId: studySet.publicId,
          name: studySet.name,
        },
      });
    }

    return result;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
