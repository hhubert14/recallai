export interface PracticeChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

/**
 * Service interface for handling streaming chat responses in practice sessions.
 * Implements the Feynman Technique by simulating a curious beginner asking questions.
 */
export interface IPracticeChatService {
  /**
   * Streams chat responses for practice sessions.
   * @param systemPrompt - The system prompt defining the AI's persona and context
   * @param messages - Conversation history
   * @param onFinish - Optional callback when streaming completes
   * @returns Response object for streaming to client
   */
  streamChat(
    systemPrompt: string,
    messages: PracticeChatMessageInput[],
    onFinish?: (fullText: string) => void
  ): Promise<Response>;
}
