import { NextRequest } from "next/server";
import { UIMessage, ModelMessage, convertToModelMessages } from "ai";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendFail, jsendError } from "@/lib/jsend";
import { getRateLimiter } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 4000;

function getTextContent(content: ModelMessage["content"]): string {
    if (typeof content === "string") return content;
    return content
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");
}
import { BuildChatContextUseCase } from "@/clean-architecture/use-cases/chat/build-chat-context.use-case";
import { SaveChatMessageUseCase } from "@/clean-architecture/use-cases/chat/save-chat-message.use-case";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleTranscriptWindowRepository } from "@/clean-architecture/infrastructure/repositories/transcript-window.repository.drizzle";
import { DrizzleChatMessageRepository } from "@/clean-architecture/infrastructure/repositories/chat-message.repository.drizzle";
import { SupabaseEmbeddingService } from "@/clean-architecture/infrastructure/services/embedding.service.supabase";
import { AiSdkVideoChatService } from "@/clean-architecture/infrastructure/services/video-chat.service.ai-sdk";
import { ChatMessageInput } from "@/clean-architecture/domain/services/video-chat.interface";

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        // Rate limiting
        const { success } = await getRateLimiter("/api/v1/chat").limit(user.id);
        if (!success) {
            return jsendFail({ error: "Rate limit exceeded. Please try again later." }, 429);
        }

        const body = await request.json();
        const { videoId, messages }: { videoId: number; messages: UIMessage[] } = body;

        if (!videoId || typeof videoId !== "number") {
            return jsendFail({ error: "Missing or invalid videoId" }, 400);
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return jsendFail({ error: "Missing or empty messages" }, 400);
        }

        // Get the last user message for context building
        const lastMessage = messages[messages.length - 1];
        const lastUserMessageText = lastMessage.parts
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

        // Build context using the use case (validation, RAG, etc.)
        const buildContextUseCase = new BuildChatContextUseCase(
            new DrizzleVideoRepository(),
            new DrizzleSummaryRepository(),
            new DrizzleTranscriptWindowRepository(),
            new SupabaseEmbeddingService()
        );

        const context = await buildContextUseCase.execute(
            user.id,
            videoId,
            lastUserMessageText.trim()
        );

        // Save messages using dedicated use case
        const saveChatMessageUseCase = new SaveChatMessageUseCase(
            new DrizzleChatMessageRepository()
        );

        // Save user message to database
        await saveChatMessageUseCase.saveUserMessage(videoId, user.id, lastUserMessageText.trim());

        // Build system prompt from context
        const systemPrompt = buildSystemPrompt(context);

        // Convert UI messages to model messages format
        const modelMessages = await convertToModelMessages(messages);
        const chatMessages: ChatMessageInput[] = modelMessages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: getTextContent(msg.content),
        }));

        // Stream response using infrastructure service
        const videoChatService = new AiSdkVideoChatService();
        return videoChatService.streamChat(systemPrompt, chatMessages, {
            onFinish: async (text) => {
                try {
                    await saveChatMessageUseCase.saveAssistantMessage(videoId, user.id, text);
                } catch (error) {
                    console.error("Failed to save assistant message:", error);
                }
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsendError(message);
    }
}

function buildSystemPrompt(context: {
    videoTitle: string;
    summary: string;
    relevantTranscriptWindows: string[];
}): string {
    let prompt = `You are a helpful AI assistant helping users understand the video "${context.videoTitle}".

VIDEO SUMMARY:
${context.summary}`;

    if (context.relevantTranscriptWindows.length > 0) {
        prompt += `

RELEVANT TRANSCRIPT SECTIONS:
${context.relevantTranscriptWindows.map((text, i) => `[Section ${i + 1}]\n${text}`).join("\n\n")}`;
    }

    prompt += `

INSTRUCTIONS:
- Answer questions based on the video content provided above
- If the user asks about something not covered in the video, acknowledge that and provide general knowledge if helpful
- Be concise but thorough
- Reference specific parts of the video content when relevant
- If you're unsure about something from the video, say so`;

    return prompt;
}
