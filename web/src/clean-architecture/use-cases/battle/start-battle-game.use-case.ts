import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";

export interface StartBattleGameInput {
  userId: string;
  roomPublicId: string;
}

export interface StartBattleGameResult {
  room: BattleRoomEntity;
}

export class StartBattleGameUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly reviewableItemRepository: IReviewableItemRepository
  ) {}

  async execute(input: StartBattleGameInput): Promise<StartBattleGameResult> {
    const { userId, roomPublicId } = input;

    // 1. Validate room
    const room =
      await this.battleRoomRepository.findBattleRoomByPublicId(roomPublicId);
    if (!room) throw new Error("Battle room not found");
    if (!room.isHost(userId))
      throw new Error("Only the host can start the game");
    if (!room.isWaiting())
      throw new Error("Battle room is not in waiting status");

    // 2. Parallel: get slots + reviewable items
    const [slots, reviewableItems] = await Promise.all([
      this.battleRoomSlotRepository.findSlotsByRoomId(room.id),
      this.reviewableItemRepository.findReviewableItemsByStudySetId(
        room.studySetId
      ),
    ]);

    // Filter to questions only
    const questionItems = reviewableItems.filter(
      (item) => item.questionId !== null
    );

    if (questionItems.length < room.questionCount) {
      throw new Error("Not enough questions available");
    }

    // Randomly select questionCount question IDs
    const shuffled = [...questionItems].sort(() => Math.random() - 0.5);
    const selectedIds = shuffled
      .slice(0, room.questionCount)
      .map((item) => item.questionId!);

    // 3. Update room to in_game
    const updatedRoom = await this.battleRoomRepository.updateBattleRoom(
      room.id,
      {
        status: "in_game",
        questionIds: selectedIds,
        currentQuestionIndex: null,
        currentQuestionStartedAt: null,
      }
    );

    return { room: updatedRoom! };
  }
}
