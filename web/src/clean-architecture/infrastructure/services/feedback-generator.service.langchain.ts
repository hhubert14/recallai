import "server-only";

import { logger } from "@/lib/logger";
import {
  IFeedbackGeneratorService,
  GenerateFeedbackInput,
} from "@/clean-architecture/domain/services/feedback-generator.interface";
import { createLangChainGateway, SUGGESTIONS_PRIORITY } from "@/lib/llm";

export class LangChainFeedbackGeneratorService
  implements IFeedbackGeneratorService
{
  async generateFeedback(input: GenerateFeedbackInput): Promise<string> {
    const { conceptName, conversationHistory } = input;

    if (!conversationHistory || conversationHistory.length === 0) {
      logger.practice.warn("No conversation history provided for feedback");
      return "Great practice session! Keep explaining concepts to deepen your understanding.";
    }

    // Format conversation for AI
    const conversationText = conversationHistory
      .map((msg) => `${msg.role === "user" ? "Learner" : "AI"}: ${msg.content}`)
      .join("\n\n");

    const systemPrompt = `You are an expert educator analyzing a practice session where a learner explained the concept "${conceptName}" using the Feynman Technique.

CONVERSATION:
${conversationText}

Provide 2-3 sentences of constructive, encouraging feedback on their explanation. Focus on:
1. What they did well (clarity, examples, understanding)
2. One specific area they could improve or explore further
3. Encouragement to continue practicing

Keep it positive, specific, and actionable. Avoid generic praise.`;

    try {
      // Override temperature in priority list
      const priorityWithTemp = SUGGESTIONS_PRIORITY.map((config) => ({
        ...config,
        temperature: 0.7,
      }));

      const gateway = createLangChainGateway();
      const feedback = await gateway.invoke(
        priorityWithTemp,
        [{ role: "user", content: systemPrompt }]
      );

      logger.practice.info("Feedback generated successfully", {
        conceptName,
        messageCount: conversationHistory.length,
        feedbackLength: feedback.length,
      });

      return feedback;
    } catch (error) {
      logger.practice.error("Error generating feedback", error, {
        conceptName,
        messageCount: conversationHistory.length,
      });

      // Graceful failure - return generic feedback
      return "Great practice session! Keep explaining concepts to deepen your understanding.";
    }
  }
}
