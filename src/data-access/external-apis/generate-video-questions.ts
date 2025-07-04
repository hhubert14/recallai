import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Define the schema for multiple choice questions only
const MultipleChoiceQuestionsSchema = z.object({
    questions: z
        .array(
            z.object({
                question: z.string().describe("The question text"),
                options: z
                    .array(z.string())
                    .length(4)
                    .describe("Four possible answer options"),
                correctAnswerIndex: z
                    .number()
                    .min(0)
                    .max(3)
                    .describe("Index of the correct answer (0-3)"),
                explanation: z
                    .string()
                    .describe(
                        "Brief explanation of why the correct answer is right"
                    ),
            })
        )
        .length(5)
        .describe("Five multiple-choice questions based on the video content"),
});

type MultipleChoiceQuestions = z.infer<typeof MultipleChoiceQuestionsSchema>;

export async function generateVideoQuestions(
    title: string,
    description: string,
    transcript: string
): Promise<MultipleChoiceQuestions | undefined> {
    if (!title || !description || !transcript) {
        logger.video.warn("Missing required parameters for question generation", {
            hasTitle: !!title,
            hasDescription: !!description,
            hasTranscript: !!transcript
        });
        return undefined;
    }

    const transcriptText = transcript;    // Initialize ChatOpenAI with structured output
    logger.video.debug("Initializing ChatOpenAI for question generation");
    const llm = new ChatOpenAI({
        model: "gpt-4.1-nano-2025-04-14", // Note: using a more standard model name
        temperature: 0,
    });

    // Create structured output chain
    const structuredLlm = llm.withStructuredOutput(
        MultipleChoiceQuestionsSchema
    );

    try {
        const result = await structuredLlm.invoke([
            {
                role: "user",
                content: `Generate meaningful multiple choice questions based on the following video:

Title: ${title}
Description: ${description}
Transcript: ${transcriptText}

Create exactly 5 multiple-choice questions that test TRANSFERABLE UNDERSTANDING of key concepts that extend beyond this specific video. Focus on:
- Universal principles and best practices
- Conceptual knowledge applicable to similar situations  
- Problem-solving approaches that generalize
- Fundamental ideas with broad implications

AVOID questions about:
- Video-specific details (particular websites, tools, or examples mentioned)
- Basic course logistics or superficial information
- Trivia that doesn't test conceptual understanding

ANSWER FORMAT REQUIREMENTS:
- All four answer options must be similar in length (within 1-2 words of each other)
- Create plausible but clearly incorrect distractors
- Avoid making the correct answer obviously longer or more detailed
- Ensure someone who understands the concept could answer without watching this specific video

Each question should test whether someone truly grasps the underlying principle, not whether they remember specific details from this video.`
            },        ]);

        logger.video.info("Questions generated successfully", {
            resultType: typeof result,
            questionCount: result?.questions?.length || 0,
            hasResult: !!result
        });

        return result;
    } catch (error) {
        logger.video.error("Error generating multiple choice questions", error, {
            title,
            transcriptLength: transcriptText?.length || 0
        });

        return undefined;
    }
}
