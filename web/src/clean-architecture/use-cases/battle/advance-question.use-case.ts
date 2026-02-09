import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";

export interface AdvanceQuestionInput {
  userId: string;
  roomPublicId: string;
}

export interface AdvanceQuestionResult {
  questionIndex: number;
  questionId: number;
  questionText: string;
  options: { id: number; optionText: string }[];
  currentQuestionStartedAt: string;
}

export class AdvanceQuestionUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(input: AdvanceQuestionInput): Promise<AdvanceQuestionResult> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isInGame()) throw new Error("Battle room is not in game");

    // Any participant can advance questions (supports host-disconnect fallback)
    const slot = await this.battleRoomSlotRepository.findSlotByUserId(userId);
    if (!slot || slot.roomId !== room.id)
      throw new Error("User is not a participant in this battle");

    if (!room.questionIds) throw new Error("No questions assigned to room");

    const nextIndex =
      room.currentQuestionIndex === null ? 0 : room.currentQuestionIndex + 1;

    if (nextIndex >= room.questionIds.length) {
      throw new Error("No more questions");
    }

    const questionId = room.questionIds[nextIndex];
    const question =
      await this.questionRepository.findQuestionById(questionId);
    if (!question) throw new Error("Question not found");

    const currentQuestionStartedAt = new Date().toISOString();

    await this.battleRoomRepository.updateBattleRoom(room.id, {
      currentQuestionIndex: nextIndex,
      currentQuestionStartedAt,
    });

    return {
      questionIndex: nextIndex,
      questionId: question.id,
      questionText: question.questionText,
      options: question.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
      currentQuestionStartedAt,
    };
  }
}
