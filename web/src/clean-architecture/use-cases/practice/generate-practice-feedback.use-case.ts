import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import {
  IFeedbackGeneratorService,
  ConversationMessage,
} from "@/clean-architecture/domain/services/feedback-generator.interface";

export class GeneratePracticeFeedbackUseCase {
  constructor(
    private readonly studySetRepository: IStudySetRepository,
    private readonly feedbackGeneratorService: IFeedbackGeneratorService
  ) {}

  async execute(
    studySetPublicId: string,
    userId: string,
    conceptName: string,
    conversationHistory: ConversationMessage[]
  ): Promise<string> {
    // 1. Verify study set exists and user owns it
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(studySetPublicId);

    if (!studySet) {
      throw new Error("Study set not found");
    }

    if (studySet.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // 2. Validate conversation history
    if (!conversationHistory || conversationHistory.length === 0) {
      throw new Error("Conversation history cannot be empty");
    }

    // 3. Generate feedback using AI service
    const feedback = await this.feedbackGeneratorService.generateFeedback({
      conceptName,
      conversationHistory,
    });

    return feedback;
  }
}
