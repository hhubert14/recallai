import { describe, it, expect, vi, beforeEach } from "vitest";
import { KickPlayerUseCase } from "./kick-player.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

describe("KickPlayerUseCase", () => {
  let useCase: KickPlayerUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;

  const hostUserId = "host-user";
  const roomPublicId = "pub-123";

  const room = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 10, "My Room", "public", null,
    "waiting", 15, 10, null, null, null,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const slots = [
    new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(2, 1, 1, "player", "other-user", null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(3, 1, 2, "empty", null, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(4, 1, 3, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
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

    useCase = new KickPlayerUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("kicks a player from the room and clears their slot", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      2, 1, 1, "empty", null, null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);

    const result = await useCase.execute({
      userId: hostUserId,
      roomPublicId,
      slotIndex: 1,
    });

    expect(result).toEqual(updatedSlot);
    expect(mockSlotRepo.updateSlot).toHaveBeenCalledWith(2, {
      slotType: "empty",
      userId: null,
      botName: null,
    });
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 1 })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when non-host tries to kick", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({
        userId: "non-host-user",
        roomPublicId,
        slotIndex: 1,
      })
    ).rejects.toThrow("Only the host can kick players");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when room is not in waiting status", async () => {
    const inGameRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 10, "My Room", "public", null,
      "in_game", 15, 10, 0, "2025-01-01T00:00:00Z", [1, 2],
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 1 })
    ).rejects.toThrow("Battle room is not in waiting status");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error for invalid slot index", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 5 })
    ).rejects.toThrow("Invalid slot index");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when host tries to kick themselves (slot 0)", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 0 })
    ).rejects.toThrow("Cannot kick yourself");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when target slot does not contain a player", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 2 })
    ).rejects.toThrow("Slot does not contain a player");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when trying to kick a bot slot", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId, slotIndex: 3 })
    ).rejects.toThrow("Slot does not contain a player");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });
});
