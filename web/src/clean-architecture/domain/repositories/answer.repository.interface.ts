import { MultipleChoiceAnswerEntity } from "../entities/answer.entity";

export interface IAnswerRepository {
  createMultipleChoiceAnswer(
    userId: string,
    questionId: number,
    selectedOptionId: number,
    isCorrect: boolean
  ): Promise<MultipleChoiceAnswerEntity>;

  findAnswersByUserId(userId: string): Promise<MultipleChoiceAnswerEntity[]>;

  // REVIEW: It's kinda confusing what number[] means. Should this return one of the entities?
  findAnsweredQuestionIdsByVideoId(
    userId: string,
    videoId: number
  ): Promise<number[]>;
}
