import { MultipleChoiceAnswerEntity } from "../entities/answer.entity";

export interface IAnswerRepository {
  createMultipleChoiceAnswer(
    userId: string,
    questionId: number,
    selectedOptionId: number,
    isCorrect: boolean
  ): Promise<MultipleChoiceAnswerEntity>;

  findAnsweredQuestionIdsByVideoId(userId: string, videoId: number): Promise<number[]>;
}
