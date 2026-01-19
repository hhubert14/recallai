import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
    IFlashcardGeneratorService,
    GeneratedFlashcardsDto,
} from "@/clean-architecture/domain/services/flashcard-generator.interface";

function createFlashcardsSchema(count: number) {
    return z.object({
        flashcards: z
            .array(
                z.object({
                    front: z
                        .string()
                        .describe("A clear question or prompt about a key concept"),
                    back: z
                        .string()
                        .describe("A concise, accurate answer (1-3 sentences)"),
                })
            )
            .length(count)
            .describe(
                `${count} flashcards capturing key concepts from the video`
            ),
    });
}

export class LangChainFlashcardGeneratorService
    implements IFlashcardGeneratorService
{
    async generate(
        title: string,
        transcript: string,
        count: number
    ): Promise<GeneratedFlashcardsDto | undefined> {
        if (!title || !transcript) {
            logger.video.warn(
                "Missing required parameters for flashcard generation",
                {
                    hasTitle: Boolean(title),
                    hasTranscript: Boolean(transcript),
                }
            );
            return undefined;
        }

        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0,
        });

        const schema = createFlashcardsSchema(count);
        const structuredLlm = llm.withStructuredOutput(schema);

        try {
            const result = await structuredLlm.invoke([
                {
                    role: "user",
                    content: `Generate flashcards based on the following video:

Title: ${title}
Transcript: ${transcript}

Create exactly ${count} flashcards that capture key concepts from this video.

Each flashcard should have:
- Front: A clear question or prompt about a key concept
- Back: A concise, accurate answer (1-3 sentences)

Focus on:
- Core concepts and definitions
- Important principles and their applications
- Key takeaways that are worth remembering

Avoid:
- Video-specific details (timestamps, speaker names)
- Trivial facts
- Questions that require watching the video to answer`,
                },
            ]);

            logger.video.info("Flashcards generated successfully", {
                resultType: typeof result,
                flashcardCount: result?.flashcards?.length || 0,
                hasResult: !!result,
            });

            return result;
        } catch (error) {
            logger.video.error(
                "Error generating flashcards",
                error,
                {
                    title,
                    transcriptLength: transcript?.length || 0,
                }
            );

            return undefined;
        }
    }
}
