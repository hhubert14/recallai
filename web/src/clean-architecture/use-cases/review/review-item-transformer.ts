import { ReviewItem, ReviewItemApiResponse } from "./types";

/**
 * Transforms a domain ReviewItem to the API response format.
 * Flattens the structure and maps entity fields to the expected API schema.
 */
export function toReviewItemApiResponse(item: ReviewItem): ReviewItemApiResponse {
  const base: ReviewItemApiResponse = {
    reviewableItemId: item.reviewableItem.id,
    itemType: item.reviewableItem.itemType,
    progress: item.progress
      ? {
          id: item.progress.id,
          boxLevel: item.progress.boxLevel,
          nextReviewDate: item.progress.nextReviewDate,
          timesCorrect: item.progress.timesCorrect,
          timesIncorrect: item.progress.timesIncorrect,
          lastReviewedAt: item.progress.lastReviewedAt,
        }
      : null,
    video: item.video,
  };

  if (item.content.type === "question") {
    return {
      ...base,
      question: {
        id: item.content.data.id,
        questionText: item.content.data.questionText,
        options: item.content.data.options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          explanation: opt.explanation,
        })),
      },
    };
  } else {
    return {
      ...base,
      flashcard: {
        id: item.content.data.id,
        front: item.content.data.front,
        back: item.content.data.back,
      },
    };
  }
}
