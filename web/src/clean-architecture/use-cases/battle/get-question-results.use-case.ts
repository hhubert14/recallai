import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";

export interface GetQuestionResultsInput {
  userId: string;
  roomPublicId: string;
}

export interface QuestionResult {
  slotIndex: number;
  userId: string | null;
  botName: string | null;
  selectedOptionId: number | null;
  isCorrect: boolean;
  score: number;
}

export interface GetQuestionResultsResult {
  questionIndex: number;
  correctOptionId: number;
  results: QuestionResult[];
}

export class GetQuestionResultsUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly battleGameAnswerRepository: IBattleGameAnswerRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(
    input: GetQuestionResultsInput
  ): Promise<GetQuestionResultsResult> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isInGame()) throw new Error("Battle room is not in game");
    if (room.currentQuestionIndex === null) throw new Error("No active question");
    if (!room.questionIds) throw new Error("No questions assigned to room");

    // Verify user is a participant
    const slot = await this.battleRoomSlotRepository.findSlotByUserId(userId);
    if (!slot || slot.roomId !== room.id)
      throw new Error("User is not a participant in this battle");

    const questionIndex = room.currentQuestionIndex;
    const questionId = room.questionIds[questionIndex];

    // Parallel: get question, slots, and answers
    const [question, slots, answers] = await Promise.all([
      this.questionRepository.findQuestionById(questionId),
      this.battleRoomSlotRepository.findSlotsByRoomId(room.id),
      this.battleGameAnswerRepository.findAnswersByRoomIdAndQuestionIndex(
        room.id,
        questionIndex
      ),
    ]);

    if (!question) throw new Error("Question not found");

    const correctOption = question.options.find((o) => o.isCorrect);
    if (!correctOption) throw new Error("No correct option found");

    // Build slot lookup by slotId
    const slotMap = new Map(slots.map((s) => [s.id, s]));

    const results: QuestionResult[] = answers.map((answer) => {
      const answerSlot = slotMap.get(answer.slotId);
      return {
        slotIndex: answerSlot?.slotIndex ?? 0,
        userId: answerSlot?.userId ?? null,
        botName: answerSlot?.botName ?? null,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: answer.isCorrect,
        score: answer.score,
      };
    });

    return {
      questionIndex,
      correctOptionId: correctOption.id,
      results,
    };
  }
}
