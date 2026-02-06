import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";

export class GetQuizCompletionStatusUseCase {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly answerRepository: IAnswerRepository
  ) {}

  async execute(userId: string, videoId: number): Promise<boolean> {
    const [questions, answeredQuestionIds] = await Promise.all([
      this.questionRepository.findQuestionsByVideoId(videoId),
      this.answerRepository.findAnsweredQuestionIdsByVideoId(userId, videoId),
    ]);

    if (questions.length === 0) {
      return false;
    }

    return questions.every((q) => answeredQuestionIds.includes(q.id));
  }
}
