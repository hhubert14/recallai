import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { MultipleChoiceAnswerEntity } from "@/clean-architecture/domain/entities/answer.entity";

export class CreateMultipleChoiceAnswerUseCase {
  constructor(private answerRepository: IAnswerRepository) {}

  async execute(
    userId: string,
    questionId: number,
    selectedOptionId: number,
    isCorrect: boolean
  ): Promise<MultipleChoiceAnswerEntity> {
    return this.answerRepository.createMultipleChoiceAnswer(
      userId,
      questionId,
      selectedOptionId,
      isCorrect
    );
  }
}
