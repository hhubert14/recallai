import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

/**
 * Study modes for the review page.
 * - 'due': Items with nextReviewDate <= today (spaced repetition)
 * - 'new': Items without any progress records yet
 * - 'random': Any items regardless of progress state
 */
export type StudyMode = "due" | "new" | "random";

/**
 * Item type filter for review queries.
 * - 'all': Return both questions and flashcards
 * - 'question': Return only questions
 * - 'flashcard': Return only flashcards
 */
export type ItemTypeFilter = "all" | "question" | "flashcard";

/**
 * Content of a reviewable item - either a question or flashcard.
 */
export type ReviewItemContent =
  | { type: "question"; data: MultipleChoiceQuestionEntity }
  | { type: "flashcard"; data: FlashcardEntity };

/**
 * A review item with its progress and content.
 * Used by the review interface to display items for review.
 */
export type ReviewItem = {
  reviewableItem: ReviewableItemEntity;
  progress: ReviewProgressEntity | null;
  content: ReviewItemContent;
  video: {
    id: number;
    title: string;
  } | null;
  studySet: {
    id: number;
    publicId: string;
    name: string;
  };
};

/**
 * Stats for the review system.
 */
export type ReviewStats = {
  dueCount: number;
  newCount: number;
  totalCount: number;
  byType: {
    questions: number;
    flashcards: number;
  };
  boxDistribution: number[]; // [box1, box2, box3, box4, box5]
};

/**
 * API response format with flattened structure for easier consumption.
 */
export type ReviewItemApiResponse = {
  reviewableItemId: number;
  itemType: "question" | "flashcard";
  progress: {
    id: number;
    boxLevel: number;
    nextReviewDate: string | null;
    timesCorrect: number;
    timesIncorrect: number;
    lastReviewedAt: string | null;
  } | null;
  question?: {
    id: number;
    questionText: string;
    options: {
      id: number;
      optionText: string;
      isCorrect: boolean;
      explanation: string | null;
    }[];
  };
  flashcard?: {
    id: number;
    front: string;
    back: string;
  };
  video: {
    id: number;
    title: string;
  } | null;
  studySet: {
    id: number;
    publicId: string;
    name: string;
  };
};
