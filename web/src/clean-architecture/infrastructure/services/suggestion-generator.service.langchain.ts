import "server-only";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import {
    ISuggestionGeneratorService,
    GenerateSuggestionsInput,
    GeneratedSuggestionsDto,
    Suggestion,
    SuggestionItemType,
} from "@/clean-architecture/domain/services/suggestion-generator.interface";
import { createLangChainGateway, SUGGESTIONS_PRIORITY } from "@/lib/llm";

// Schema for flashcard suggestion
const flashcardSchema = z.object({
    itemType: z.literal("flashcard"),
    front: z
        .string()
        .describe("A clear question or prompt about a key concept"),
    back: z
        .string()
        .describe("A concise, accurate answer (1-3 sentences)"),
});

// Schema for question option
const questionOptionSchema = z.object({
    optionText: z.string().describe("The text of the answer option"),
    isCorrect: z.boolean().describe("Whether this is the correct answer"),
    explanation: z
        .string()
        .describe("Brief explanation of why this option is correct or incorrect"),
});

// Schema for question suggestion
const questionSchema = z.object({
    itemType: z.literal("question"),
    questionText: z.string().describe("The question text"),
    options: z
        .array(questionOptionSchema)
        .length(4)
        .describe("Four possible answer options with exactly one correct")
        .refine(
            (options) => options.filter((o) => o.isCorrect).length === 1,
            { message: "Exactly one option must be marked as correct" }
        ),
});

// Discriminated union for suggestion type (used for "mix" mode)
const mixedSuggestionSchema = z.discriminatedUnion("itemType", [
    flashcardSchema,
    questionSchema,
]);

function createSuggestionsSchema(count: number, itemType: SuggestionItemType) {
    const itemSchema =
        itemType === "flashcards"
            ? flashcardSchema
            : itemType === "questions"
              ? questionSchema
              : mixedSuggestionSchema;

    const description =
        itemType === "flashcards"
            ? `${count} flashcards`
            : itemType === "questions"
              ? `${count} multiple choice questions`
              : `${count} learning items (mix of flashcards and questions)`;

    return z.object({
        suggestions: z.array(itemSchema).min(1).max(count).describe(description),
    });
}

export class LangChainSuggestionGeneratorService
    implements ISuggestionGeneratorService
{
    async generate(
        input: GenerateSuggestionsInput
    ): Promise<GeneratedSuggestionsDto | undefined> {
        const { prompt, count, itemType, title, transcript } = input;

        if (!prompt) {
            logger.video.warn(
                "Missing required prompt for suggestion generation"
            );
            return undefined;
        }

        const schema = createSuggestionsSchema(count, itemType);

        // Build the context section based on available data
        let contextSection = "";
        if (title && transcript) {
            // Video-sourced: Include title and transcript as context
            contextSection = `
VIDEO CONTEXT:
Title: ${title}
Transcript: ${transcript}

Use the video content as your primary source of information. The user's prompt below indicates what aspects they want to focus on or learn about.
`;
        } else {
            // Manual study set: No context, rely solely on prompt
            contextSection = `
Note: This is a general topic study set with no video context. Generate content based solely on the user's prompt using your general knowledge.
`;
        }

        // Build item type instruction based on selection
        let itemTypeInstruction = "";
        if (itemType === "flashcards") {
            itemTypeInstruction = `Generate exactly ${count} FLASHCARDS.

FLASHCARD FORMAT:
- Front: A clear question or prompt
- Back: A concise, accurate answer (1-3 sentences)`;
        } else if (itemType === "questions") {
            itemTypeInstruction = `Generate exactly ${count} MULTIPLE CHOICE QUESTIONS.

QUESTION FORMAT:
- Clear question text
- Exactly 4 options with similar length
- Exactly ONE correct answer
- Brief explanations for each option (why correct or incorrect)
- Plausible distractors that test understanding`;
        } else {
            itemTypeInstruction = `Generate exactly ${count} learning items. For EACH item, decide whether it should be a FLASHCARD or a QUESTION based on what's most effective:

- Use FLASHCARDS for: definitions, terminology, facts, dates, vocabulary, key terms, simple recall, formulas
- Use QUESTIONS for: conceptual understanding, application of knowledge, comparing ideas, analyzing relationships, comprehension checks

FLASHCARD FORMAT:
- Front: A clear question or prompt
- Back: A concise, accurate answer (1-3 sentences)

QUESTION FORMAT:
- Clear question text
- Exactly 4 options with similar length
- Exactly ONE correct answer
- Brief explanations for each option (why correct or incorrect)
- Plausible distractors that test understanding`;
        }

        const fullPrompt = `Generate learning items based on the following:
${contextSection}
USER PROMPT: ${prompt}

${itemTypeInstruction}

QUALITY GUIDELINES:
- Focus on transferable knowledge that applies broadly
- Avoid trivial or overly specific details
- Create content that promotes genuine understanding
- Ensure all content is factually accurate`;

        try {
            // Override temperature in priority list
            const priorityWithTemp = SUGGESTIONS_PRIORITY.map((config) => ({
                ...config,
                temperature: 0.7,
            }));

            const gateway = createLangChainGateway();
            const result = await gateway.invokeWithStructuredOutput(
                priorityWithTemp,
                schema,
                [{ role: "user", content: fullPrompt }]
            );

            logger.video.info("Suggestions generated successfully", {
                resultType: typeof result,
                suggestionCount: result?.suggestions?.length || 0,
                hasResult: !!result,
            });

            // Add tempIds to each suggestion
            const suggestionsWithIds: Suggestion[] = result.suggestions.map(
                (suggestion) => ({
                    ...suggestion,
                    tempId: uuidv4(),
                })
            );

            return {
                suggestions: suggestionsWithIds,
            };
        } catch (error) {
            logger.video.error(
                "Error generating suggestions",
                error,
                {
                    prompt,
                    hasTranscript: !!transcript,
                    count,
                }
            );

            return undefined;
        }
    }
}
