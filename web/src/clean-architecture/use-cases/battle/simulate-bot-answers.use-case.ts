import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { simulateBotAnswer } from "@/lib/battle/bot-simulation";
import { calculateAnswerScore } from "@/lib/battle/scoring";

export interface SimulateBotAnswersInput {
  userId: string;
  roomPublicId: string;
}

export interface BotAnswerResult {
  slotId: number;
  isCorrect: boolean;
  score: number;
}

export interface SimulateBotAnswersResult {
  botAnswers: BotAnswerResult[];
}

export class SimulateBotAnswersUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly battleGameAnswerRepository: IBattleGameAnswerRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(
    input: SimulateBotAnswersInput
  ): Promise<SimulateBotAnswersResult> {
    const { userId, roomPublicId } = input;

    // 1. Find room first (need room.id for slots query)
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isHost(userId))
      throw new Error("Only the host can simulate bot answers");
    if (!room.isInGame()) throw new Error("Battle room is not in game");
    if (room.currentQuestionIndex === null) throw new Error("No active question");
    if (!room.questionIds) throw new Error("No questions assigned to room");
    if (!room.currentQuestionStartedAt) throw new Error("No active question");

    // 2. Parallel: get slots + question
    const currentQuestionIndex = room.currentQuestionIndex;
    const questionId = room.questionIds[currentQuestionIndex];
    const [slots, question] = await Promise.all([
      this.battleRoomSlotRepository.findSlotsByRoomId(room.id),
      this.questionRepository.findQuestionById(questionId),
    ]);

    if (!question) throw new Error("Question not found");

    // 3. Filter to bots and simulate answers
    const botSlots = slots.filter((slot) => slot.isBot());
    if (botSlots.length === 0) return { botAnswers: [] };

    const optionsForBot = question.options.map((opt) => ({
      id: opt.id,
      isCorrect: opt.isCorrect,
    }));

    const botAnswers: BotAnswerResult[] = [];

    // Parallelize bot answer inserts
    const questionStartedAt = new Date(room.currentQuestionStartedAt);
    const results = await Promise.allSettled(
      botSlots.map(async (botSlot) => {
        const botAnswer = simulateBotAnswer(
          optionsForBot,
          room.timeLimitSeconds
        );

        // Bot's answeredAt = questionStartedAt + delayMs
        const answeredAt = new Date(
          questionStartedAt.getTime() + botAnswer.delayMs
        ).toISOString();

        const score = calculateAnswerScore(
          botAnswer.isCorrect,
          questionStartedAt,
          new Date(answeredAt),
          room.timeLimitSeconds
        );

        await this.battleGameAnswerRepository.createBattleGameAnswer({
          roomId: room.id,
          slotId: botSlot.id,
          questionId,
          questionIndex: currentQuestionIndex,
          selectedOptionId: botAnswer.selectedOptionId,
          isCorrect: botAnswer.isCorrect,
          answeredAt,
          score,
        });

        return { slotId: botSlot.id, isCorrect: botAnswer.isCorrect, score };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        botAnswers.push(result.value);
      }
      // Skip bots that already answered (UNIQUE constraint violation)
    }

    return { botAnswers };
  }
}
