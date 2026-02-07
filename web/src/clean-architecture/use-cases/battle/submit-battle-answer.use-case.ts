import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { calculateAnswerScore } from "@/lib/battle/scoring";

export interface SubmitBattleAnswerInput {
  userId: string;
  roomPublicId: string;
  selectedOptionId: number;
}

export interface SubmitBattleAnswerResult {
  isCorrect: boolean;
  score: number;
}

export class SubmitBattleAnswerUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly battleGameAnswerRepository: IBattleGameAnswerRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(
    input: SubmitBattleAnswerInput
  ): Promise<SubmitBattleAnswerResult> {
    const { userId, roomPublicId, selectedOptionId } = input;

    // 1. Parallel: find room + find slot
    const [room, slot] = await Promise.all([
      this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId),
      this.battleRoomSlotRepository.findSlotByUserId(userId),
    ]);

    if (!room) throw new Error("Battle room not found");
    if (!room.isInGame()) throw new Error("Battle room is not in game");
    if (!slot || slot.roomId !== room.id)
      throw new Error("User is not a participant in this battle");
    if (room.currentQuestionIndex === null) throw new Error("No active question");

    // 2. Fetch question
    const questionId = room.questionIds![room.currentQuestionIndex];
    const question =
      await this.questionRepository.findQuestionById(questionId);

    const selectedOption = question!.options.find(
      (opt) => opt.id === selectedOptionId
    );
    if (!selectedOption) throw new Error("Invalid option");

    // 3. Compute score + create answer
    const answeredAt = new Date().toISOString();
    const isCorrect = selectedOption.isCorrect;
    const score = calculateAnswerScore(
      isCorrect,
      new Date(room.currentQuestionStartedAt!),
      new Date(answeredAt),
      room.timeLimitSeconds
    );

    try {
      await this.battleGameAnswerRepository.createBattleGameAnswer({
        roomId: room.id,
        slotId: slot.id,
        questionId,
        questionIndex: room.currentQuestionIndex,
        selectedOptionId,
        isCorrect,
        answeredAt,
        score,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("unique constraint") || message.includes("duplicate key")) {
        throw new Error("Already answered this question");
      }
      throw error;
    }

    return { isCorrect, score };
  }
}
