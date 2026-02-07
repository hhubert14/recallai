import { describe, it, expect, vi, beforeEach } from "vitest";
import { StartBattleGameUseCase } from "./start-battle-game.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { ReviewableItemEntity } from "@/clean-architecture/domain/entities/reviewable-item.entity";

describe("StartBattleGameUseCase", () => {
  let useCase: StartBattleGameUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockReviewableItemRepo: IReviewableItemRepository;

  const hostUserId = "host-user-123";
  const roomPublicId = "room-pub-123";

  const waitingRoom = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
    "waiting", 15, 5, null, null, null,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const hostSlot = new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z");

  function makeReviewableItems(count: number): ReviewableItemEntity[] {
    return Array.from({ length: count }, (_, i) =>
      new ReviewableItemEntity(
        i + 1, hostUserId, "question", i + 1, null, null, 1, "2025-01-01T00:00:00Z"
      )
    );
  }

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

    mockReviewableItemRepo = {
      createReviewableItemsForQuestionsBatch: vi.fn(),
      createReviewableItemsForFlashcardsBatch: vi.fn(),
      findReviewableItemsByUserId: vi.fn(),
      findReviewableItemsByUserIdAndVideoId: vi.fn(),
      findReviewableItemsByStudySetId: vi.fn(),
      findReviewableItemsByUserIdAndStudySetId: vi.fn(),
      findReviewableItemByQuestionId: vi.fn(),
      findReviewableItemByFlashcardId: vi.fn(),
      findReviewableItemById: vi.fn(),
      findReviewableItemsByIds: vi.fn(),
      countItemsByStudySetId: vi.fn(),
      countItemsByStudySetIdsBatch: vi.fn(),
    };

    useCase = new StartBattleGameUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockReviewableItemRepo
    );
  });

  it("starts a solo game (host only)", async () => {
    const updatedRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 5, null, null, [1, 2, 3, 4, 5],
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:01Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue([hostSlot]);
    vi.mocked(mockReviewableItemRepo.findReviewableItemsByStudySetId).mockResolvedValue(
      makeReviewableItems(10)
    );
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(updatedRoom);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.room.status).toBe("in_game");
    expect(mockRoomRepo.updateBattleRoom).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        status: "in_game",
        currentQuestionIndex: null,
        currentQuestionStartedAt: null,
      })
    );
    // Verify questionIds has correct count
    const updateCall = vi.mocked(mockRoomRepo.updateBattleRoom).mock.calls[0];
    expect(updateCall[1].questionIds).toHaveLength(5);
  });

  it("starts a game with players and bots", async () => {
    const slots = [
      hostSlot,
      new BattleRoomSlotEntity(2, 1, 1, "player", "player-2", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    const updatedRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 5, null, null, [1, 2, 3, 4, 5],
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:01Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockReviewableItemRepo.findReviewableItemsByStudySetId).mockResolvedValue(
      makeReviewableItems(10)
    );
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(updatedRoom);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.room.status).toBe("in_game");
  });

  it("randomly selects questionCount questions from available pool", async () => {
    const items = makeReviewableItems(20); // 20 available, need 5

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue([hostSlot]);
    vi.mocked(mockReviewableItemRepo.findReviewableItemsByStudySetId).mockResolvedValue(items);
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(waitingRoom);

    await useCase.execute({ userId: hostUserId, roomPublicId });

    const updateCall = vi.mocked(mockRoomRepo.updateBattleRoom).mock.calls[0];
    const questionIds = updateCall[1].questionIds!;
    expect(questionIds).toHaveLength(5);
    // All IDs should be unique
    expect(new Set(questionIds).size).toBe(5);
    // All IDs should come from the items
    const validIds = items.map((i) => i.questionId!);
    for (const id of questionIds) {
      expect(validIds).toContain(id);
    }
  });

  it("filters out non-question reviewable items", async () => {
    const items = [
      ...makeReviewableItems(5),
      // Flashcard items (questionId is null)
      new ReviewableItemEntity(6, hostUserId, "flashcard", null, 1, null, 1, "2025-01-01T00:00:00Z"),
      new ReviewableItemEntity(7, hostUserId, "flashcard", null, 2, null, 1, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue([hostSlot]);
    vi.mocked(mockReviewableItemRepo.findReviewableItemsByStudySetId).mockResolvedValue(items);
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(waitingRoom);

    await useCase.execute({ userId: hostUserId, roomPublicId });

    const updateCall = vi.mocked(mockRoomRepo.updateBattleRoom).mock.calls[0];
    const questionIds = updateCall[1].questionIds!;
    expect(questionIds).toHaveLength(5);
    // None should be null (from flashcards)
    for (const id of questionIds) {
      expect(id).not.toBeNull();
    }
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when user is not the host", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);

    await expect(
      useCase.execute({ userId: "other-user", roomPublicId })
    ).rejects.toThrow("Only the host can start the game");
  });

  it("throws error when room is not in waiting status", async () => {
    const inGameRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 5, 0, "2025-01-01T00:00:00Z", [1, 2, 3, 4, 5],
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room is not in waiting status");
  });

  it("throws error when not enough questions available", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue([hostSlot]);
    vi.mocked(mockReviewableItemRepo.findReviewableItemsByStudySetId).mockResolvedValue(
      makeReviewableItems(3) // only 3, but need 5
    );

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Not enough questions available");
  });
});
