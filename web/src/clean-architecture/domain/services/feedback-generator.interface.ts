export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateFeedbackInput {
  conceptName: string;
  conversationHistory: ConversationMessage[];
}

/**
 * Service interface for generating feedback on practice sessions.
 * Analyzes conversation quality and provides constructive feedback.
 */
export interface IFeedbackGeneratorService {
  /**
   * Generates 2-3 sentence feedback based on the practice conversation.
   * @param input - Concept name and conversation history
   * @returns Constructive feedback text
   */
  generateFeedback(input: GenerateFeedbackInput): Promise<string>;
}
