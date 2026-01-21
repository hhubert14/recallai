import { QuestionWithProgress } from "./get-questions-for-review.use-case";

/**
 * Study modes for the review page.
 * - 'due': Questions with nextReviewDate <= today (spaced repetition)
 * - 'new': Questions without any progress records yet
 * - 'random': Any questions regardless of progress state
 */
export type StudyMode = "due" | "new" | "random";

export type StudyModeParams =
  | { mode: "due" }
  | { mode: "new" }
  | { mode: "random" };

/**
 * Extended type for API responses that includes video title and publicId.
 * The API route enriches QuestionWithProgress with video info for display and navigation.
 */
export type QuestionWithProgressApiResponse = {
  progress: QuestionWithProgress["progress"];
  question: QuestionWithProgress["question"] & {
    videoTitle: string;
    videoPublicId: string;
  };
};
