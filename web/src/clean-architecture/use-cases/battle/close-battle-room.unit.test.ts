import { describe, it, expect, vi, beforeEach } from "vitest";
import { CloseBattleRoomUseCase } from "./close-battle-room.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

describe("CloseBattleRoomUseCase", () => {
  let useCase: CloseBattleRoomUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;

  const hostUserId = "host-user";
  const playerUserId = "player-user";
  const roomPublicId = "pub-123";

  const room = new BattleRoomEntity(
    1,
    roomPublicId,
    hostUserId,
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

  const inGameRoom = new BattleRoomEntity(
    1,
    roomPublicId,
    hostUserId,
    10,
    "My Room",
    "public",
    null,
    "in_game",
    15,
    10,
    0,
    "2025-01-01T00:00:00Z",
    [1, 2, 3],
    "2025-01-01T00:00:00Z",
    "2025-01-01T00:00:00Z"
  );

  const slots = [
    new BattleRoomSlotEntity(
      1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"
    ),
    new BattleRoomSlotEntity(
      2, 1, 1, "player", playerUserId, null, "2025-01-01T00:00:00Z"
    ),
    new BattleRoomSlotEntity(
      3, 1, 2, "empty", null, null, "2025-01-01T00:00:00Z"
    ),
    new BattleRoomSlotEntity(
      4, 1, 3, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"
    ),
  ];

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

    useCase = new CloseBattleRoomUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("deletes the room when a player in the room closes it", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await useCase.execute({ userId: playerUserId, roomPublicId });

    expect(mockRoomRepo.deleteBattleRoom).toHaveBeenCalledWith(1);
  });

  it("allows the host to close the room", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(mockRoomRepo.deleteBattleRoom).toHaveBeenCalledWith(1);
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: playerUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when user is not in the room", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await expect(
      useCase.execute({ userId: "stranger-user", roomPublicId })
    ).rejects.toThrow("User is not in this battle room");

    expect(mockRoomRepo.deleteBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error when room is not in waiting status", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(
      inGameRoom
    );
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await expect(
      useCase.execute({ userId: playerUserId, roomPublicId })
    ).rejects.toThrow("Room can only be closed while in waiting status");
  });
});
