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
