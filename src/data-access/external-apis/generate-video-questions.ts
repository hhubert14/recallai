import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

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
        console.log("❌ Missing required parameters");
        console.log(
            "Missing - Title:",
            !title,
            "Description:",
            !description,
            "Transcript:",
            !transcript
        );
        return undefined;
    }

    const transcriptText = transcript;

    // Initialize ChatOpenAI with structured output
    console.log("🔧 Initializing ChatOpenAI...");
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

Please provide exactly 5 multiple-choice questions that test SUBSTANTIVE UNDERSTANDING of key concepts, not just superficial details. Focus on:
- Core concepts and their applications
- Technical knowledge and principles
- Problem-solving approaches
- Fundamental ideas and their implications

AVOID questions about:
- Basic course information (title, instructor, date)
- Superficial details (what university offers it, course logistics)
- Trivial facts that don't test understanding

Each question should include:
- Question text focusing on important concepts
- Four answer options (only one correct)
- The index of the correct answer (0-3)
- A brief explanation for why the correct answer is right

Make the questions challenging but fair, testing genuine understanding of important concepts from the video.`,
            },
        ]);

        console.log("✅ LLM API call successful");
        console.log("Result type:", typeof result);
        console.log("Result keys:", result ? Object.keys(result) : "NO RESULT");
        console.log("Number of questions:", result?.questions?.length || 0);

        return result;
    } catch (error) {
        console.error("❌ Error generating multiple choice questions:", error);
        console.error(
            "Error type:",
            error instanceof Error ? error.constructor.name : typeof error
        );
        console.error(
            "Error message:",
            error instanceof Error ? error.message : String(error)
        );

        if (error instanceof Error && error.stack) {
            console.error("Error stack:", error.stack);
        }

        return undefined;
    }
}
