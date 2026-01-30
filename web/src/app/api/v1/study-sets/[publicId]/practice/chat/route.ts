import { NextRequest } from "next/server";
import { UIMessage, ModelMessage, convertToModelMessages } from "ai";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendError } from "@/lib/jsend";
import { getRateLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { BuildPracticeContextUseCase, ConceptInput } from "@/clean-architecture/use-cases/practice/build-practice-context.use-case";
import { UpdateStreakUseCase } from "@/clean-architecture/use-cases/streak/update-streak.use-case";
import { DrizzleStudySetRepository } from "@/clean-architecture/infrastructure/repositories/study-set.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleFlashcardRepository } from "@/clean-architecture/infrastructure/repositories/flashcard.repository.drizzle";
import { DrizzleStreakRepository } from "@/clean-architecture/infrastructure/repositories/streak.repository.drizzle";
import { AiSdkPracticeChatService } from "@/clean-architecture/infrastructure/services/practice-chat.service.ai-sdk";
import { PracticeChatMessageInput } from "@/clean-architecture/domain/services/practice-chat.interface";

const MAX_MESSAGE_LENGTH = 4000;

function getTextContent(content: ModelMessage["content"]): string {
    if (typeof content === "string") return content;
    return content
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");
}

/**
 * POST /api/v1/study-sets/[publicId]/practice/chat
 * Streaming chat endpoint for practice sessions (Feynman Technique)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        // Rate limiting
        const { success } = await getRateLimiter("/api/v1/practice/chat").limit(user.id);
        if (!success) {
            return jsendFail({ error: "Rate limit exceeded. Please try again later." }, 429);
        }

        const { publicId } = await params;
        const body = await request.json();
        const { messages, concept }: { messages: UIMessage[]; concept: ConceptInput } = body;

        // Validate messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return jsendFail({ error: "Missing or empty messages" }, 400);
        }

        // Validate concept
        if (!concept || typeof concept !== "object") {
            return jsendFail({ error: "Missing concept data" }, 400);
        }

        if (!concept.conceptName || typeof concept.conceptName !== "string") {
            return jsendFail({ error: "Missing or invalid conceptName" }, 400);
        }

        if (!concept.description || typeof concept.description !== "string") {
            return jsendFail({ error: "Missing or invalid concept description" }, 400);
        }

        if (!Array.isArray(concept.itemIds) || concept.itemIds.length === 0) {
            return jsendFail({ error: "Missing or empty itemIds" }, 400);
        }

        // Get the last user message
        const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
        if (!lastUserMessage) {
            return jsendFail({ error: "No user message provided" }, 400);
        }
        const lastUserMessageText = (lastUserMessage.parts ?? [])
            .filter((part): part is { type: "text"; text: string } => part.type === "text")
            .map((part) => part.text)
            .join("");

        if (!lastUserMessageText.trim()) {
            return jsendFail({ error: "Empty message content" }, 400);
        }

        if (lastUserMessageText.length > MAX_MESSAGE_LENGTH) {
            return jsendFail({
                error: `Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`
            }, 400);
        }

        // Build practice context using the use case
        const buildContextUseCase = new BuildPracticeContextUseCase(
            new DrizzleStudySetRepository(),
            new DrizzleQuestionRepository(),
            new DrizzleFlashcardRepository()
        );

        const context = await buildContextUseCase.execute(publicId, user.id, concept);

        // Update streak (non-blocking)
        new UpdateStreakUseCase(new DrizzleStreakRepository())
            .execute(user.id)
            .catch((error) => logger.streak.error("Failed to update streak", error, { userId: user.id }));

        // Build system prompt
        const systemPrompt = buildSystemPrompt(context);

        // Convert UI messages to practice chat messages format
        const modelMessages = await convertToModelMessages(messages);
        const chatMessages: PracticeChatMessageInput[] = modelMessages
            .filter(
                (msg): msg is ModelMessage & { role: "user" | "assistant" } =>
                    msg.role === "user" || msg.role === "assistant"
            )
            .map((msg) => ({
                role: msg.role,
                content: getTextContent(msg.content),
            }))
            .filter((msg) => msg.content.trim().length > 0);

        // Stream response using infrastructure service
        const practiceChatService = new AiSdkPracticeChatService();
        return practiceChatService.streamChat(systemPrompt, chatMessages);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Map specific errors to appropriate HTTP status codes
        if (message === "Study set not found") {
            return jsendFail({ error: message }, 404);
        }
        if (message === "Unauthorized") {
            return jsendFail({ error: message }, 403);
        }

        return jsendError(message);
    }
}

function buildSystemPrompt(context: {
    conceptName: string;
    conceptDescription: string;
    relatedItems: string[];
}): string {
    let prompt = `You are a curious beginner learning about "${context.conceptName}".

CONCEPT OVERVIEW:
${context.conceptDescription}

RELATED STUDY ITEMS:
${context.relatedItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

YOUR ROLE:
- You are someone who is just learning about ${context.conceptName}
- Ask clarifying questions when the explanation is unclear
- Request examples if the concept seems abstract
- Point out if you notice any gaps in the explanation
- Be encouraging but honest about what makes sense and what doesn't
- Help the student practice the Feynman Technique by making them explain in simple terms

STARTING THE CONVERSATION:
- If the user's message is "[START]", this means the practice session is beginning
- Introduce yourself naturally and ask your first question about the concept
- Example: "Hey! I've been trying to understand ${context.conceptName}. Could you explain [specific aspect] to me?"
- Do NOT acknowledge "[START]" or say things like "Sure!" - just start the conversation naturally

GUIDELINES:
- Ask follow-up questions based on the student's explanations
- If something is well-explained, acknowledge it and move to a related aspect
- If something is unclear, ask for a simpler explanation or an example
- Encourage the student to connect concepts to real-world applications
- Keep responses concise (2-3 sentences typically)`;

    return prompt;
}
