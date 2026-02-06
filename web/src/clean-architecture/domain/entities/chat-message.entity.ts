export type ChatMessageRole = "user" | "assistant";

export class ChatMessageEntity {
  constructor(
    public readonly id: number,
    public readonly videoId: number,
    public readonly userId: string,
    public readonly role: ChatMessageRole,
    public readonly content: string,
    public readonly createdAt: string
  ) {}
}
