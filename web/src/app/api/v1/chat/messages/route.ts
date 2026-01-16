import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail } from "@/lib/jsend";
import { DrizzleChatMessageRepository } from "@/clean-architecture/infrastructure/repositories/chat-message.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";

export async function GET(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const searchParams = request.nextUrl.searchParams;
        const videoIdParam = searchParams.get("videoId");

        if (!videoIdParam) {
            return jsendFail({ error: "Missing videoId parameter" }, 400);
        }

        const videoId = parseInt(videoIdParam, 10);
        if (isNaN(videoId)) {
            return jsendFail({ error: "Invalid videoId parameter" }, 400);
        }

        // Verify user owns the video
        const videoRepo = new DrizzleVideoRepository();
        const video = await videoRepo.findVideoById(videoId);

        if (!video) {
            return jsendFail({ error: "Video not found" }, 404);
        }

        if (video.userId !== user.id) {
            return jsendFail({ error: "Not authorized to access this video" }, 403);
        }

        const chatMessageRepo = new DrizzleChatMessageRepository();
        const messages = await chatMessageRepo.findChatMessagesByVideoIdAndUserId(
            videoId,
            user.id
        );

        return jsendSuccess({
            messages: messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsendFail({ error: message }, 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const searchParams = request.nextUrl.searchParams;
        const videoIdParam = searchParams.get("videoId");

        if (!videoIdParam) {
            return jsendFail({ error: "Missing videoId parameter" }, 400);
        }

        const videoId = parseInt(videoIdParam, 10);
        if (isNaN(videoId)) {
            return jsendFail({ error: "Invalid videoId parameter" }, 400);
        }

        // Verify user owns the video
        const videoRepo = new DrizzleVideoRepository();
        const video = await videoRepo.findVideoById(videoId);

        if (!video) {
            return jsendFail({ error: "Video not found" }, 404);
        }

        if (video.userId !== user.id) {
            return jsendFail({ error: "Not authorized to access this video" }, 403);
        }

        const chatMessageRepo = new DrizzleChatMessageRepository();
        await chatMessageRepo.deleteChatMessagesByVideoIdAndUserId(videoId, user.id);

        return jsendSuccess({ message: "Chat history cleared" });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsendFail({ error: message }, 500);
    }
}
