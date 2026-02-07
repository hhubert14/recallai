import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
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
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(input: AdvanceQuestionInput): Promise<AdvanceQuestionResult> {
    const { userId, roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isHost(userId))
      throw new Error("Only the host can advance questions");
    if (!room.isInGame()) throw new Error("Battle room is not in game");

    const nextIndex =
      room.currentQuestionIndex === null ? 0 : room.currentQuestionIndex + 1;

    if (nextIndex >= room.questionIds!.length) {
      throw new Error("No more questions");
    }

    const questionId = room.questionIds![nextIndex];
    const question =
      await this.questionRepository.findQuestionById(questionId);

    const currentQuestionStartedAt = new Date().toISOString();

    await this.battleRoomRepository.updateBattleRoom(room.id, {
      currentQuestionIndex: nextIndex,
      currentQuestionStartedAt,
    });

    return {
      questionIndex: nextIndex,
      questionId: question!.id,
      questionText: question!.questionText,
      options: question!.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
      currentQuestionStartedAt,
    };
  }
}
