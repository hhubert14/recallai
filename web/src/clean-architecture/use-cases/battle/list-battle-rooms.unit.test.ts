import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListBattleRoomsUseCase } from "./list-battle-rooms.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

describe("ListBattleRoomsUseCase", () => {
  let useCase: ListBattleRoomsUseCase;
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

    useCase = new ListBattleRoomsUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("returns rooms with slot summaries", async () => {
    const room1 = new BattleRoomEntity(
      1, "pub-1", "user-1", 10, "Room 1", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );
    const room2 = new BattleRoomEntity(
      2, "pub-2", "user-2", 20, "Room 2", "private", "hash",
      "waiting", 20, 5, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomsByStatus).mockResolvedValue([room1, room2]);

    // Room 1: 1 player (host), 1 bot, 1 empty, 1 locked
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockImplementation(async (roomId) => {
      if (roomId === 1) {
        return [
          new BattleRoomSlotEntity(1, 1, 0, "player", "user-1", null, "2025-01-01T00:00:00Z"),
          new BattleRoomSlotEntity(2, 1, 1, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
          new BattleRoomSlotEntity(3, 1, 2, "empty", null, null, "2025-01-01T00:00:00Z"),
          new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
        ];
      }
      // Room 2: 2 players, 0 bots, 2 empty
      return [
        new BattleRoomSlotEntity(5, 2, 0, "player", "user-2", null, "2025-01-01T00:00:00Z"),
        new BattleRoomSlotEntity(6, 2, 1, "player", "user-3", null, "2025-01-01T00:00:00Z"),
        new BattleRoomSlotEntity(7, 2, 2, "empty", null, null, "2025-01-01T00:00:00Z"),
        new BattleRoomSlotEntity(8, 2, 3, "empty", null, null, "2025-01-01T00:00:00Z"),
      ];
    });

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].room).toEqual(room1);
    expect(result[0].slotSummary).toEqual({
      playerCount: 1,
      botCount: 1,
      openSlots: 1,
    });
    expect(result[1].room).toEqual(room2);
    expect(result[1].slotSummary).toEqual({
      playerCount: 2,
      botCount: 0,
      openSlots: 2,
    });
  });

  it("returns empty array when no rooms are waiting", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomsByStatus).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRoomRepo.findBattleRoomsByStatus).toHaveBeenCalledWith("waiting");
  });
});
