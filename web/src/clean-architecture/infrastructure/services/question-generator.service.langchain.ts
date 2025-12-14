import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
    IQuestionGeneratorService,
    GeneratedQuestionsDto,
} from "@/clean-architecture/domain/services/question-generator.interface";

function createQuestionsSchema(count: number) {
    return z.object({
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
            .length(count)
            .describe(
                `${count} multiple-choice questions based on the video content`
            ),
    });
}

export class LangChainQuestionGeneratorService
    implements IQuestionGeneratorService
{
    async generate(
        title: string,
        // description: string,
        transcript: string,
        count: number
    ): Promise<GeneratedQuestionsDto | undefined> {
        if (!title || !transcript) {
            logger.video.warn(
                "Missing required parameters for question generation",
                {
                    hasTitle: Boolean(title),
                    // hasDescription: Boolean(description),
                    hasTranscript: Boolean(transcript),
                }
            );
            return undefined;
        }

        const llm = new ChatOpenAI({
            model: "gpt-4.1-nano-2025-04-14",
            temperature: 0,
        });

        const schema = createQuestionsSchema(count);
        const structuredLlm = llm.withStructuredOutput(schema);

        try {
            const result = await structuredLlm.invoke([
                {
                    role: "user",
                    content: `Generate meaningful multiple choice questions based on the following video:

Title: ${title}
Transcript: ${transcript}

Create exactly ${count} multiple-choice questions that test TRANSFERABLE UNDERSTANDING of key concepts that extend beyond this specific video. Focus on:
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

Each question should test whether someone truly grasps the underlying principle, not whether they remember specific details from this video.`,
                },
            ]);

            logger.video.info("Questions generated successfully", {
                resultType: typeof result,
                questionCount: result?.questions?.length || 0,
                hasResult: !!result,
            });

            return result;
        } catch (error) {
            logger.video.error(
                "Error generating multiple choice questions",
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
