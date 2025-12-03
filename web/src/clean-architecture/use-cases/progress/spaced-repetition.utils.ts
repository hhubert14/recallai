/**
 * Spaced Repetition Utilities
 * 
 * Implements the Leitner box system for optimal learning through spaced repetition.
 * 
 * The system uses 5 boxes with increasing review intervals:
 * - Box 1: Review in 1 day (struggling)
 * - Box 2: Review in 3 days
 * - Box 3: Review in 7 days
 * - Box 4: Review in 14 days
 * - Box 5: Review in 30 days (mastered)
 * 
 * Correct answers move the question up one box (max box 5).
 * Incorrect answers reset the question to box 1.
 */

import { SPACED_REPETITION } from "@/lib/constants";

/**
 * Calculates the next review date based on the box level
 * 
 * @param boxLevel - Current box level (1-5)
 * @returns ISO date string (YYYY-MM-DD) for the next review
 * @throws Error if boxLevel is not between 1-5
 * 
 * @example
 * ```ts
 * getNextReviewDate(3) // Returns date 7 days from now
 * getNextReviewDate(5) // Returns date 30 days from now
 * ```
 */
export function getNextReviewDate(boxLevel: number): string {
  // Validate box level is within valid range
  if (boxLevel < SPACED_REPETITION.MIN_BOX_LEVEL || boxLevel > SPACED_REPETITION.MAX_BOX_LEVEL) {
    throw new Error(`Invalid box level: ${boxLevel}. Must be between ${SPACED_REPETITION.MIN_BOX_LEVEL} and ${SPACED_REPETITION.MAX_BOX_LEVEL}`);
  }
  
  const interval = SPACED_REPETITION.BOX_INTERVALS[boxLevel as keyof typeof SPACED_REPETITION.BOX_INTERVALS];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate.toISOString().split("T")[0];
}

/**
 * Determines the next box level based on answer correctness
 * 
 * @param currentBox - Current box level (1-5)
 * @param isCorrect - Whether the answer was correct
 * @returns Next box level (1-5)
 * 
 * @example
 * ```ts
 * getNextBoxLevel(2, true)  // Returns 3 (move up)
 * getNextBoxLevel(4, false) // Returns 1 (reset to start)
 * getNextBoxLevel(5, true)  // Returns 5 (already at max)
 * ```
 */
export function getNextBoxLevel(currentBox: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.min(currentBox + 1, SPACED_REPETITION.MAX_BOX_LEVEL);
  } else {
    return SPACED_REPETITION.MIN_BOX_LEVEL;
  }
}

/**
 * Calculates all fields needed to update user progress after answering a question
 * 
 * @param currentBoxLevel - Current box level (1-5)
 * @param isCorrect - Whether the answer was correct
 * @param currentCorrectCount - Number of times answered correctly
 * @param currentIncorrectCount - Number of times answered incorrectly
 * @returns Updated progress fields
 * 
 * @example
 * ```ts
 * calculateProgressUpdate(2, true, 5, 2)
 * // Returns:
 * // {
 * //   boxLevel: 3,
 * //   nextReviewDate: "2025-12-10",
 * //   timesCorrect: 6,
 * //   timesIncorrect: 2,
 * //   lastReviewedAt: "2025-12-03T04:20:00.000Z"
 * // }
 * ```
 */
export function calculateProgressUpdate(
  currentBoxLevel: number,
  isCorrect: boolean,
  currentCorrectCount: number,
  currentIncorrectCount: number
) {
  const newBoxLevel = getNextBoxLevel(currentBoxLevel, isCorrect);
  const nextReviewDate = getNextReviewDate(newBoxLevel);

  return {
    boxLevel: newBoxLevel,
    nextReviewDate: nextReviewDate,
    timesCorrect: isCorrect ? currentCorrectCount + 1 : currentCorrectCount,
    timesIncorrect: isCorrect ? currentIncorrectCount : currentIncorrectCount + 1,
    lastReviewedAt: new Date().toISOString(),
  };
}
