export class MultipleChoiceAnswerEntity {
  readonly type = "multiple-choice" as const;

  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly questionId: number,
    public readonly selectedOptionId: number,
    public readonly isCorrect: boolean,
    public readonly createdAt: string,
  ) {}
}

export type AnswerEntity = MultipleChoiceAnswerEntity;
