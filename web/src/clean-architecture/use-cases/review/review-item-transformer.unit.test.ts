import { describe, it, expect } from "vitest";
import { toReviewItemApiResponse } from "./review-item-transformer";
import { ReviewItem } from "./types";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";
import { ReviewProgressEntity } from "@/clean-architecture/domain/entities/review-progress.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("toReviewItemApiResponse", () => {
  const mockVideo = {
    id: 1,
    title: "Test Video",
  };

  const mockStudySet = {
    id: 1,
    publicId: "study-set-123",
    name: "Test Study Set",
  };

  describe("with question content", () => {
    const mockQuestion = new MultipleChoiceQuestionEntity(
      10,
      1,
      "What is TypeScript?",
      [
        new MultipleChoiceOption(1, "A language", true, "Correct!"),
        new MultipleChoiceOption(2, "A framework", false, null),
        new MultipleChoiceOption(3, "A library", false, null),
        new MultipleChoiceOption(4, "A tool", false, null),
      ]
    );

    const mockReviewableItem = new ReviewableItemEntity(
      100,
      "user-1",
      "question",
      10,  // questionId
      null, // flashcardId
      1,    // videoId
      1, // studySetId
      "2025-01-01T00:00:00Z"
    );

    it("transforms question item with progress", () => {
      const mockProgress = new ReviewProgressEntity(
        200,
        "user-1",
        100,
        3,
        "2025-01-15",
        5,
        2,
        "2025-01-10T10:00:00Z",
        "2025-01-01T00:00:00Z" // createdAt
      );

      const reviewItem: ReviewItem = {
        reviewableItem: mockReviewableItem,
        progress: mockProgress,
        content: { type: "question", data: mockQuestion },
        video: mockVideo,
        studySet: mockStudySet,
      };

      const result = toReviewItemApiResponse(reviewItem);

      expect(result.reviewableItemId).toBe(100);
      expect(result.itemType).toBe("question");
      expect(result.video).toEqual(mockVideo);
      expect(result.studySet).toEqual(mockStudySet);
      expect(result.progress).toEqual({
        id: 200,
        boxLevel: 3,
        nextReviewDate: "2025-01-15",
        timesCorrect: 5,
        timesIncorrect: 2,
        lastReviewedAt: "2025-01-10T10:00:00Z",
      });
      expect(result.question).toEqual({
        id: 10,
        questionText: "What is TypeScript?",
        options: [
          { id: 1, optionText: "A language", isCorrect: true, explanation: "Correct!" },
          { id: 2, optionText: "A framework", isCorrect: false, explanation: null },
          { id: 3, optionText: "A library", isCorrect: false, explanation: null },
          { id: 4, optionText: "A tool", isCorrect: false, explanation: null },
        ],
      });
      expect(result.flashcard).toBeUndefined();
    });

    it("transforms question item without progress (new item)", () => {
      const reviewItem: ReviewItem = {
        reviewableItem: mockReviewableItem,
        progress: null,
        content: { type: "question", data: mockQuestion },
        video: mockVideo,
        studySet: mockStudySet,
      };

      const result = toReviewItemApiResponse(reviewItem);

      expect(result.reviewableItemId).toBe(100);
      expect(result.itemType).toBe("question");
      expect(result.progress).toBeNull();
      expect(result.question).toBeDefined();
      expect(result.flashcard).toBeUndefined();
    });
  });

  describe("with flashcard content", () => {
    const mockFlashcard = new FlashcardEntity(
      20,
      1,
      "user-1",
      "What is React?",
      "A JavaScript library for building UIs",
      "2025-01-01T00:00:00Z"
    );

    const mockReviewableItem = new ReviewableItemEntity(
      101,
      "user-1",
      "flashcard",
      null, // questionId
      20,   // flashcardId
      1,    // videoId
      1, // studySetId
      "2025-01-01T00:00:00Z"
    );

    it("transforms flashcard item with progress", () => {
      const mockProgress = new ReviewProgressEntity(
        201,
        "user-1",
        101,
        5,
        "2025-02-01",
        10,
        1,
        "2025-01-20T10:00:00Z",
        "2025-01-01T00:00:00Z" // createdAt
      );

      const reviewItem: ReviewItem = {
        reviewableItem: mockReviewableItem,
        progress: mockProgress,
        content: { type: "flashcard", data: mockFlashcard },
        video: mockVideo,
        studySet: mockStudySet,
      };

      const result = toReviewItemApiResponse(reviewItem);

      expect(result.reviewableItemId).toBe(101);
      expect(result.itemType).toBe("flashcard");
      expect(result.video).toEqual(mockVideo);
      expect(result.studySet).toEqual(mockStudySet);
      expect(result.progress).toEqual({
        id: 201,
        boxLevel: 5,
        nextReviewDate: "2025-02-01",
        timesCorrect: 10,
        timesIncorrect: 1,
        lastReviewedAt: "2025-01-20T10:00:00Z",
      });
      expect(result.flashcard).toEqual({
        id: 20,
        front: "What is React?",
        back: "A JavaScript library for building UIs",
      });
      expect(result.question).toBeUndefined();
    });

    it("transforms flashcard item without progress (new item)", () => {
      const reviewItem: ReviewItem = {
        reviewableItem: mockReviewableItem,
        progress: null,
        content: { type: "flashcard", data: mockFlashcard },
        video: mockVideo,
        studySet: mockStudySet,
      };

      const result = toReviewItemApiResponse(reviewItem);

      expect(result.reviewableItemId).toBe(101);
      expect(result.itemType).toBe("flashcard");
      expect(result.progress).toBeNull();
      expect(result.flashcard).toBeDefined();
      expect(result.question).toBeUndefined();
    });
  });

  describe("progress with null dates", () => {
    it("handles null nextReviewDate and lastReviewedAt", () => {
      const mockFlashcard = new FlashcardEntity(
        20,
        1,
        "user-1",
        "Front",
        "Back",
        "2025-01-01T00:00:00Z"
      );

      const mockReviewableItem = new ReviewableItemEntity(
        101,
        "user-1",
        "flashcard",
        null, // questionId
        20,   // flashcardId
        1,    // videoId
        1, // studySetId
        "2025-01-01T00:00:00Z"
      );

      const mockProgress = new ReviewProgressEntity(
        201,
        "user-1",
        101,
        1,
        null,
        0,
        0,
        null,
        "2025-01-01T00:00:00Z" // createdAt
      );

      const reviewItem: ReviewItem = {
        reviewableItem: mockReviewableItem,
        progress: mockProgress,
        content: { type: "flashcard", data: mockFlashcard },
        video: mockVideo,
        studySet: mockStudySet,
      };

      const result = toReviewItemApiResponse(reviewItem);

      expect(result.progress).toEqual({
        id: 201,
        boxLevel: 1,
        nextReviewDate: null,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastReviewedAt: null,
      });
    });
  });
});
