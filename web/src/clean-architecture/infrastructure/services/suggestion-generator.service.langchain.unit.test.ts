import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-define schemas here to avoid "server-only" import issue in tests.
// These schemas must match the ones in suggestion-generator.service.langchain.ts
const questionOptionSchema = z.object({
  optionText: z.string().describe("The text of the answer option"),
  isCorrect: z.boolean().describe("Whether this is the correct answer"),
  explanation: z
    .string()
    .describe("Brief explanation of why this option is correct or incorrect"),
});

const questionSchema = z.object({
  itemType: z.literal("question"),
  questionText: z.string().describe("The question text"),
  options: z
    .array(questionOptionSchema)
    .length(4)
    .describe("Four possible answer options with exactly one correct")
    .refine((options) => options.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked as correct",
    }),
});

describe("questionSchema Zod validation", () => {
  const createValidOption = (isCorrect: boolean) => ({
    optionText: "Option text",
    isCorrect,
    explanation: "Explanation text",
  });

  describe("options array validation - exactly one correct answer", () => {
    it("rejects when zero options are marked as correct", () => {
      const invalidQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(false),
          createValidOption(false),
          createValidOption(false),
          createValidOption(false),
        ],
      };

      const result = questionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Exactly one option must be marked as correct"
        );
      }
    });

    it("rejects when multiple options are marked as correct", () => {
      const invalidQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(true),
          createValidOption(true),
          createValidOption(false),
          createValidOption(false),
        ],
      };

      const result = questionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Exactly one option must be marked as correct"
        );
      }
    });

    it("accepts when exactly one option is marked as correct", () => {
      const validQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(true),
          createValidOption(false),
          createValidOption(false),
          createValidOption(false),
        ],
      };

      const result = questionSchema.safeParse(validQuestion);

      expect(result.success).toBe(true);
    });

    it("rejects when all options are marked as correct", () => {
      const invalidQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(true),
          createValidOption(true),
          createValidOption(true),
          createValidOption(true),
        ],
      };

      const result = questionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Exactly one option must be marked as correct"
        );
      }
    });
  });

  describe("options array length validation", () => {
    it("rejects when fewer than 4 options are provided", () => {
      const invalidQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(true),
          createValidOption(false),
          createValidOption(false),
        ],
      };

      const result = questionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it("rejects when more than 4 options are provided", () => {
      const invalidQuestion = {
        itemType: "question" as const,
        questionText: "What is 2 + 2?",
        options: [
          createValidOption(true),
          createValidOption(false),
          createValidOption(false),
          createValidOption(false),
          createValidOption(false),
        ],
      };

      const result = questionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });
  });
});
