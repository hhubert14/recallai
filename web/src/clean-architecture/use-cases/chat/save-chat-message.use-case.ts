import { IChatMessageRepository } from "@/clean-architecture/domain/repositories/chat-message.repository.interface";

export class SaveChatMessageUseCase {
  constructor(private readonly chatMessageRepository: IChatMessageRepository) {}

  async saveUserMessage(
    videoId: number,
    userId: string,
    message: string
  ): Promise<void> {
    await this.chatMessageRepository.createChatMessage(
      videoId,
      userId,
      "user",
      message
    );
  }

  async saveAssistantMessage(
    videoId: number,
    userId: string,
    message: string
  ): Promise<void> {
    await this.chatMessageRepository.createChatMessage(
      videoId,
      userId,
      "assistant",
      message
    );
  }
}
