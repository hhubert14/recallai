import { describe, it, expect, vi, beforeEach } from "vitest";
import { JoinBattleRoomUseCase } from "./join-battle-room.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

vi.mock("@/lib/battle/password", () => ({
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

import { verifyPassword } from "@/lib/battle/password";

describe("JoinBattleRoomUseCase", () => {
  let useCase: JoinBattleRoomUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;

  const userId = "user-456";
  const roomPublicId = "pub-123";

  const publicRoom = new BattleRoomEntity(
    1, roomPublicId, "host-user", 10, "Public Room", "public", null,
    "waiting", 15, 10, null, null, null,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const privateRoom = new BattleRoomEntity(
    2, "pub-456", "host-user", 10, "Private Room", "private", "salt:hash",
    "waiting", 15, 10, null, null, null,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const slotsWithEmpty = [
    new BattleRoomSlotEntity(1, 1, 0, "player", "host-user", null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(2, 1, 1, "empty", null, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
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

    useCase = new JoinBattleRoomUseCase(mockRoomRepo, mockSlotRepo);
  });

  it("joins a public room and fills the first empty slot", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      2, 1, 1, "player", userId, null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(publicRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slotsWithEmpty);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);

    const result = await useCase.execute({ userId, roomPublicId });

    expect(result).toEqual(updatedSlot);
    expect(mockSlotRepo.updateSlot).toHaveBeenCalledWith(
      2,
      { slotType: "player", userId, botName: null },
      "empty"
    );
  });

  it("joins a private room with correct password", async () => {
    const updatedSlot = new BattleRoomSlotEntity(
      2, 2, 1, "player", userId, null, "2025-01-01T00:00:00Z"
    );

    const privateSlots = [
      new BattleRoomSlotEntity(1, 2, 0, "player", "host-user", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 2, 1, "empty", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 2, 2, "empty", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 2, 3, "empty", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(privateRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(privateSlots);
    vi.mocked(mockSlotRepo.updateSlot).mockResolvedValue(updatedSlot);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const result = await useCase.execute({
      userId,
      roomPublicId: "pub-456",
      password: "correct-password",
    });

    expect(result).toEqual(updatedSlot);
    expect(verifyPassword).toHaveBeenCalledWith("correct-password", "salt:hash");
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, roomPublicId })
    ).rejects.toThrow("Battle room not found");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when room is not in waiting status", async () => {
    const inGameRoom = new BattleRoomEntity(
      1, roomPublicId, "host-user", 10, "In Game Room", "public", null,
      "in_game", 15, 10, 0, "2025-01-01T00:00:00Z", [1, 2, 3],
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ userId, roomPublicId })
    ).rejects.toThrow("Battle room is not accepting players");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when user is already in a battle room", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(publicRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(
      new BattleRoomSlotEntity(99, 5, 0, "player", userId, null, "2025-01-01T00:00:00Z")
    );

    await expect(
      useCase.execute({ userId, roomPublicId })
    ).rejects.toThrow("User is already in a battle room");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when password is incorrect for private room", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(privateRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId,
        roomPublicId: "pub-456",
        password: "wrong-password",
      })
    ).rejects.toThrow("Incorrect password");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when no password provided for private room", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(privateRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, roomPublicId: "pub-456" })
    ).rejects.toThrow("Incorrect password");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when private room has null passwordHash", async () => {
    const misconfiguredRoom = new BattleRoomEntity(
      3, "pub-789", "host-user", 10, "Broken Room", "private", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(misconfiguredRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, roomPublicId: "pub-789", password: "any-password" })
    ).rejects.toThrow("Incorrect password");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });

  it("throws error when room is full (no empty slots)", async () => {
    const fullSlots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", "host-user", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "player", "user-2", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Alex Bot", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(publicRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(fullSlots);

    await expect(
      useCase.execute({ userId, roomPublicId })
    ).rejects.toThrow("Battle room is full");

    expect(mockSlotRepo.updateSlot).not.toHaveBeenCalled();
  });
});
