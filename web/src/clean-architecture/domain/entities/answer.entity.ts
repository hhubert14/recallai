export type MultipleChoiceAnswerEntity = {
  readonly type: "multiple-choice";
  readonly id: number;
  readonly userId: string;
  readonly questionId: number;
  readonly selectedOptionId: number;
  readonly isCorrect: boolean;
  readonly createdAt: string;
};

export type AnswerEntity = MultipleChoiceAnswerEntity;
