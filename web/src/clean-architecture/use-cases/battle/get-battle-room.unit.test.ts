import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBattleRoomUseCase } from "./get-battle-room.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

describe("GetBattleRoomUseCase", () => {
  let useCase: GetBattleRoomUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;

  beforeEach(() => {
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

    useCase = new GetBattleRoomUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("returns room and slots for a valid publicId", async () => {
    const room = new BattleRoomEntity(
      1,
      "pub-123",
      "user-1",
      10,
      "My Room",
      "public",
      null,
      "waiting",
      15,
      10,
      null,
      null,
      null,
      "2025-01-01T00:00:00Z",
      "2025-01-01T00:00:00Z"
    );

    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", "user-1", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "empty", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    const result = await useCase.execute("pub-123");

    expect(result.room).toEqual(room);
    expect(result.slots).toEqual(slots);
    expect(mockRoomRepo.findBattleRoomByPublicId).toHaveBeenCalledWith("pub-123");
    expect(mockSlotRepo.findSlotsByRoomId).toHaveBeenCalledWith(1);
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Battle room not found"
    );

    expect(mockSlotRepo.findSlotsByRoomId).not.toHaveBeenCalled();
  });
});
