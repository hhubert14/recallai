import { IChatMessageRepository } from "@/clean-architecture/domain/repositories/chat-message.repository.interface";
import {
  ChatMessageEntity,
  ChatMessageRole,
} from "@/clean-architecture/domain/entities/chat-message.entity";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { chatMessages } from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

export class DrizzleChatMessageRepository implements IChatMessageRepository {
  async createChatMessage(
    videoId: number,
    userId: string,
    role: ChatMessageRole,
    content: string
  ): Promise<ChatMessageEntity> {
    const [data] = await dbRetry(() =>
      db
        .insert(chatMessages)
        .values({ videoId, userId, role, content })
        .returning()
    );

    return this.toEntity(data);
  }

  async findChatMessagesByVideoIdAndUserId(
    videoId: number,
    userId: string
  ): Promise<ChatMessageEntity[]> {
    const data = await dbRetry(() =>
      db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.videoId, videoId),
            eq(chatMessages.userId, userId)
          )
        )
        .orderBy(asc(chatMessages.createdAt))
    );

    return data.map((message) => this.toEntity(message));
  }

  async deleteChatMessagesByVideoIdAndUserId(
    videoId: number,
    userId: string
  ): Promise<void> {
    await dbRetry(() =>
      db
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.videoId, videoId),
            eq(chatMessages.userId, userId)
          )
        )
    );
  }

  private toEntity(data: typeof chatMessages.$inferSelect): ChatMessageEntity {
    return new ChatMessageEntity(
      data.id,
      data.videoId,
      data.userId,
      data.role as ChatMessageRole,
      data.content,
      data.createdAt
    );
  }
}
