import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { BattleRoomEntity, BattleRoomVisibility } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { hashPassword } from "@/lib/battle/password";

const ALLOWED_TIME_LIMITS = [10, 15, 20, 30];
const ALLOWED_QUESTION_COUNTS = [5, 10, 15, 20];

export interface CreateBattleRoomInput {
  userId: string;
  studySetPublicId: string;
  name: string;
  visibility: BattleRoomVisibility;
  password?: string;
  timeLimitSeconds: number;
  questionCount: number;
}

export interface CreateBattleRoomResult {
  room: BattleRoomEntity;
  slots: BattleRoomSlotEntity[];
}

export class CreateBattleRoomUseCase {
  constructor(
    private readonly battleRoomRepository: IBattleRoomRepository,
    private readonly battleRoomSlotRepository: IBattleRoomSlotRepository,
    private readonly studySetRepository: IStudySetRepository,
    private readonly reviewableItemRepository: IReviewableItemRepository
  ) {}

  async execute(input: CreateBattleRoomInput): Promise<CreateBattleRoomResult> {
    const {
      userId,
      studySetPublicId,
      name,
      visibility,
      password,
      timeLimitSeconds,
      questionCount,
    } = input;

    // Validate name
    if (!name.trim()) {
      throw new Error("Room name is required");
    }

    // Validate time limit
    if (!ALLOWED_TIME_LIMITS.includes(timeLimitSeconds)) {
      throw new Error("Invalid time limit");
    }

    // Validate question count
    if (!ALLOWED_QUESTION_COUNTS.includes(questionCount)) {
      throw new Error("Invalid question count");
    }

    // Validate password for private rooms
    if (visibility === "private" && !password) {
      throw new Error("Password is required for private rooms");
    }

    // Check user is not already in a room
    const existingSlot =
      await this.battleRoomSlotRepository.findSlotByUserId(userId);
    if (existingSlot) {
      const existingRoom =
        await this.battleRoomRepository.findBattleRoomById(existingSlot.roomId);
      if (!existingRoom || existingRoom.isFinished()) {
        // Stale slot from a finished/deleted game — clean up
        if (existingRoom) {
          await this.battleRoomRepository.deleteBattleRoom(existingRoom.id);
        } else {
          await this.battleRoomSlotRepository.deleteSlotsByRoomId(
            existingSlot.roomId
          );
        }
      } else {
        throw new Error("User is already in a battle room");
      }
    }

    // Verify study set exists
    const studySet =
      await this.studySetRepository.findStudySetByPublicId(studySetPublicId);
    if (!studySet) {
      throw new Error("Study set not found");
    }

    // Verify user owns the study set
    if (studySet.userId !== userId) {
      throw new Error("Not authorized to use this study set");
    }

    // Check study set has enough MCQ questions
    const counts =
      await this.reviewableItemRepository.countItemsByStudySetIdsBatch([
        studySet.id,
      ]);
    const questionCountInSet = counts[studySet.id]?.questions ?? 0;
    if (questionCountInSet < questionCount) {
      throw new Error("Study set does not have enough questions");
    }

    // Hash password if private
    const passwordHash =
      visibility === "private" && password
        ? await hashPassword(password)
        : null;

    // Create room
    const room = await this.battleRoomRepository.createBattleRoom({
      hostUserId: userId,
      studySetId: studySet.id,
      name: name.trim(),
      visibility,
      passwordHash,
      timeLimitSeconds,
      questionCount,
    });

    // Create 4 slots: slot 0 = host player, slots 1-3 = locked
    const slots = await this.battleRoomSlotRepository.createBattleRoomSlotsBatch(
      [
        { roomId: room.id, slotIndex: 0, slotType: "player", userId, botName: null },
        { roomId: room.id, slotIndex: 1, slotType: "locked", userId: null, botName: null },
        { roomId: room.id, slotIndex: 2, slotType: "locked", userId: null, botName: null },
        { roomId: room.id, slotIndex: 3, slotType: "locked", userId: null, botName: null },
      ]
    );

    return { room, slots };
  }
}
