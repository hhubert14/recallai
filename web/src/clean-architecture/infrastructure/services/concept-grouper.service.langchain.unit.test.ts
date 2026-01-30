import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-define schemas here to avoid "server-only" import issue in tests.
// These schemas must match the ones in concept-grouper.service.langchain.ts
const conceptGroupSchema = z.object({
  conceptName: z
    .string()
    .describe("A clear, descriptive name for the concept (2-5 words)"),
  description: z
    .string()
    .describe(
      "A brief description of what this concept covers (1-2 sentences)"
    ),
  itemIds: z
    .array(z.string())
    .min(1)
    .describe("Array of item IDs that belong to this concept"),
});

const conceptsOutputSchema = z.object({
  concepts: z
    .array(conceptGroupSchema)
    .min(2)
    .max(5)
    .describe("2-5 broader concepts that group related study items"),
});

describe("conceptsOutputSchema Zod validation", () => {
  describe("concepts array validation", () => {
    it("rejects when fewer than 2 concepts are provided", () => {
      const invalidOutput = {
        concepts: [
          {
            conceptName: "Single Concept",
            description: "Only one concept",
            itemIds: ["item1", "item2"],
          },
        ],
      };

      const result = conceptsOutputSchema.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 2");
      }
    });

    it("rejects when more than 5 concepts are provided", () => {
      const invalidOutput = {
        concepts: Array.from({ length: 6 }, (_, i) => ({
          conceptName: `Concept ${i + 1}`,
          description: `Description for concept ${i + 1}`,
          itemIds: [`item${i}`],
        })),
      };

      const result = conceptsOutputSchema.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at most 5");
      }
    });

    it("accepts when 2 concepts are provided", () => {
      const validOutput = {
        concepts: [
          {
            conceptName: "Basic Concepts",
            description: "Fundamental ideas and terminology",
            itemIds: ["item1", "item2"],
          },
          {
            conceptName: "Advanced Topics",
            description: "Complex applications and edge cases",
            itemIds: ["item3", "item4"],
          },
        ],
      };

      const result = conceptsOutputSchema.safeParse(validOutput);

      expect(result.success).toBe(true);
    });

    it("accepts when 5 concepts are provided", () => {
      const validOutput = {
        concepts: Array.from({ length: 5 }, (_, i) => ({
          conceptName: `Concept ${i + 1}`,
          description: `Description for concept ${i + 1}`,
          itemIds: [`item${i}`],
        })),
      };

      const result = conceptsOutputSchema.safeParse(validOutput);

      expect(result.success).toBe(true);
    });
  });

  describe("concept group validation", () => {
    it("rejects concept with empty itemIds array", () => {
      const invalidOutput = {
        concepts: [
          {
            conceptName: "Empty Concept",
            description: "Has no items",
            itemIds: [],
          },
          {
            conceptName: "Valid Concept",
            description: "Has items",
            itemIds: ["item1"],
          },
        ],
      };

      const result = conceptsOutputSchema.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 1");
      }
    });

    it("accepts concept with multiple itemIds", () => {
      const validOutput = {
        concepts: [
          {
            conceptName: "Multi-Item Concept",
            description: "Groups several related items",
            itemIds: ["item1", "item2", "item3", "item4"],
          },
          {
            conceptName: "Another Concept",
            description: "Different group",
            itemIds: ["item5"],
          },
        ],
      };

      const result = conceptsOutputSchema.safeParse(validOutput);

      expect(result.success).toBe(true);
    });

    it("requires all fields in concept group", () => {
      const invalidOutput = {
        concepts: [
          {
            conceptName: "Missing Description",
            itemIds: ["item1"],
            // description is missing
          },
          {
            conceptName: "Valid Concept",
            description: "Has all fields",
            itemIds: ["item2"],
          },
        ],
      };

      const result = conceptsOutputSchema.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });
});
