import { describe, it, expect, vi, beforeEach } from "vitest";
import { FinishBattleGameUseCase } from "./finish-battle-game.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

describe("FinishBattleGameUseCase", () => {
  let useCase: FinishBattleGameUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;

  const hostUserId = "host-user-123";
  const roomPublicId = "room-pub-123";
  const questionIds = [10, 20, 30];

  const hostSlot = new BattleRoomSlotEntity(
    1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"
  );

  const inGameRoom = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
    "in_game", 15, 3, 2, "2025-01-01T00:00:10.000Z", questionIds,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  beforeEach(() => {
    vi.clearAllMocks();

    mockRoomRepo = {
      createBattleRoom: vi.fn(),
      findBattleRoomById: vi.fn(),
      findBattleRoomByPublicId: vi.fn(),
      findBattleRoomsByStatus: vi.fn(),
      findBattleRoomsByHostUserId: vi.fn(),
      updateBattleRoom: vi.fn(),
      deleteBattleRoom: vi.fn(),
    };

    mockSlotRepo = {
      createBattleRoomSlotsBatch: vi.fn(),
      findSlotsByRoomId: vi.fn(),
      findSlotByUserId: vi.fn(),
      updateSlot: vi.fn(),
      deleteSlotsByRoomId: vi.fn(),
    };

    useCase = new FinishBattleGameUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("finishes an in-game battle", async () => {
    const finishedRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "finished", 15, 3, null, null, questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:15Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(hostSlot);
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(finishedRoom);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.status).toBe("finished");
    expect(mockRoomRepo.updateBattleRoom).toHaveBeenCalledWith(1, {
      status: "finished",
      currentQuestionIndex: null,
      currentQuestionStartedAt: null,
    });
    expect(mockRoomRepo.deleteBattleRoom).toHaveBeenCalledWith(1);
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when user is not a participant", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: "other-user", roomPublicId })
    ).rejects.toThrow("User is not a participant in this battle");
  });

  it("throws error when room is not in game", async () => {
    const waitingRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "waiting", 15, 3, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room is not in game");
  });
});
