import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateBattleRoomSlotUseCase } from "./update-battle-room-slot.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

vi.mock("@/lib/battle/bot-names", () => ({
  generateBotName: vi.fn().mockReturnValue("Luna Bot"),
}));

describe("UpdateBattleRoomSlotUseCase", () => {
  let useCase: UpdateBattleRoomSlotUseCase;
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
    new BattleRoomSlotEntity(2, 1, 1, "empty", null, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(3, 1, 2, "player", "other-user", null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(4, 1, 3, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
  ];

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

    useCase = new UpdateBattleRoomSlotUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("sets an empty slot to bot with auto-generated name", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      2, 1, 1, "bot", null, "Luna Bot", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);

    const result = await useCase.execute({
      userId: hostUserId,
      roomPublicId,
      slotIndex: 1,
      slotType: "bot",
    });

    expect(result).toEqual(updatedSlot);
    expect(mockSlotRepo.updateSlot).toHaveBeenCalledWith(2, {
      slotType: "bot",
      userId: null,
      botName: "Luna Bot",
    });
  });

  it("sets a bot slot to empty and clears botName", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      4, 1, 3, "empty", null, null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);

    const result = await useCase.execute({
      userId: hostUserId,
      roomPublicId,
      slotIndex: 3,
      slotType: "empty",
    });

    expect(result).toEqual(updatedSlot);
    expect(mockSlotRepo.updateSlot).toHaveBeenCalledWith(4, {
      slotType: "empty",
      userId: null,
      botName: null,
    });
  });

  it("sets an empty slot to locked", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      2, 1, 1, "locked", null, null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);

    const result = await useCase.execute({
      userId: hostUserId,
      roomPublicId,
      slotIndex: 1,
      slotType: "locked",
    });

    expect(result).toEqual(updatedSlot);
    expect(mockSlotRepo.updateSlot).toHaveBeenCalledWith(2, {
      slotType: "locked",
      userId: null,
      botName: null,
    });
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: hostUserId,
        roomPublicId,
        slotIndex: 1,
        slotType: "bot",
      })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when non-host tries to modify slots", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({
        userId: "non-host-user",
        roomPublicId,
        slotIndex: 1,
        slotType: "bot",
      })
    ).rejects.toThrow("Only the host can modify slots");

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
      useCase.execute({
        userId: hostUserId,
        roomPublicId,
        slotIndex: 1,
        slotType: "bot",
      })
    ).rejects.toThrow("Battle room is not in waiting status");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error for invalid slot index", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({
        userId: hostUserId,
        roomPublicId,
        slotIndex: 5,
        slotType: "bot",
      })
    ).rejects.toThrow("Invalid slot index");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when trying to modify the host slot", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);

    await expect(
      useCase.execute({
        userId: hostUserId,
        roomPublicId,
        slotIndex: 0,
        slotType: "bot",
      })
    ).rejects.toThrow("Cannot modify the host slot");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when trying to modify a slot occupied by a player", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);

    await expect(
      useCase.execute({
        userId: hostUserId,
        roomPublicId,
        slotIndex: 2,
        slotType: "bot",
      })
    ).rejects.toThrow("Cannot modify a slot occupied by a player");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });
});
