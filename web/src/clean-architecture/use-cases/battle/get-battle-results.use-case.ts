import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { rankGameResults } from "@/lib/battle/scoring";

export interface GetBattleResultsInput {
  roomPublicId: string;
}

export interface PlayerResult {
  rank: number;
  slotIndex: number;
  userId: string | null;
  botName: string | null;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
}

export interface GetBattleResultsResult {
  room: BattleRoomEntity;
  results: PlayerResult[];
}

export class GetBattleResultsUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly battleGameAnswerRepository: IBattleGameAnswerRepository
  ) {}

  async execute(
    input: GetBattleResultsInput
  ): Promise<GetBattleResultsResult> {
    const { roomPublicId } = input;

    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isFinished()) throw new Error("Game has not finished yet");

    // Parallel: get slots + answers
    const [slots, answers] = await Promise.all([
      this.battleRoomSlotRepository.findSlotsByRoomId(room.id),
      this.battleGameAnswerRepository.findAnswersByRoomId(room.id),
    ]);

    const ranked = rankGameResults(answers);

    // Build slot lookup
    const slotMap = new Map(slots.map((s) => [s.id, s]));

    const results: PlayerResult[] = ranked.map((r) => {
      const slot = slotMap.get(r.slotId);
      return {
        rank: r.rank,
        slotIndex: slot?.slotIndex ?? 0,
        userId: slot?.userId ?? null,
        botName: slot?.botName ?? null,
        totalScore: r.totalScore,
        correctCount: r.correctCount,
        totalQuestions: r.totalQuestions,
      };
    });

    return { room, results };
  }
}
