import {
  ChatMessageEntity,
  ChatMessageRole,
} from "@/clean-architecture/domain/entities/chat-message.entity";

export interface IChatMessageRepository {
  createChatMessage(
    videoId: number,
    userId: string,
    role: ChatMessageRole,
    content: string
  ): Promise<ChatMessageEntity>;

  findChatMessagesByVideoIdAndUserId(
    videoId: number,
    userId: string
  ): Promise<ChatMessageEntity[]>;

  deleteChatMessagesByVideoIdAndUserId(
    videoId: number,
    userId: string
  ): Promise<void>;
}
