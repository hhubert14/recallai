import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  IConceptGrouperService,
  GroupConceptsInput,
  ConceptGroup,
} from "@/clean-architecture/domain/services/concept-grouper.interface";

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

export class LangChainConceptGrouperService implements IConceptGrouperService {
  async groupConcepts(input: GroupConceptsInput): Promise<ConceptGroup[]> {
    const { items, studySetTitle } = input;

    if (!items || items.length === 0) {
      logger.practice.warn("No items provided for concept grouping");
      return [];
    }

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.5, // Balanced creativity for grouping
    });

    const structuredLlm = llm.withStructuredOutput(conceptsOutputSchema);

    // Format items for AI consumption
    const itemsList = items
      .map((item) => {
        const typeLabel = item.type === "question" ? "Q" : "F";
        return `[${typeLabel}-${item.id}] ${item.content}`;
      })
      .join("\n");

    const titleContext = studySetTitle
      ? `Study Set: "${studySetTitle}"\n\n`
      : "";

    const systemPrompt = `${titleContext}Analyze the following study items and group them into 2-5 broader concepts. Each concept should:

1. Group related items that share a common theme or topic
2. Have a clear, descriptive name (2-5 words)
3. Include a brief description explaining what the concept covers
4. Contain the IDs of items that belong to this concept

STUDY ITEMS:
${itemsList}

GUIDELINES:
- Create meaningful groupings that help learners understand connections
- Each item should belong to exactly one concept
- Aim for balanced groups (avoid 1 concept with all items)
- Focus on thematic or topical relationships
- Use all provided item IDs in your grouping`;

    try {
      const result = await structuredLlm.invoke([
        {
          role: "user",
          content: systemPrompt,
        },
      ]);

      logger.practice.info("Concepts grouped successfully", {
        conceptCount: result?.concepts?.length || 0,
        itemCount: items.length,
      });

      return result.concepts;
    } catch (error) {
      logger.practice.error("Error grouping concepts", error, {
        itemCount: items.length,
        hasTitle: !!studySetTitle,
      });

      // Graceful failure - return empty array
      return [];
    }
  }
}
