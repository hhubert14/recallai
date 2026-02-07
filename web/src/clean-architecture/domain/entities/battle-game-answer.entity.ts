export class BattleGameAnswerEntity {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly slotId: number,
    public readonly questionId: number,
    public readonly questionIndex: number,
    public readonly selectedOptionId: number | null,
    public readonly isCorrect: boolean,
    public readonly answeredAt: string,
    public readonly score: number
  ) {}
}
