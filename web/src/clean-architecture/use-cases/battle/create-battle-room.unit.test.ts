import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateBattleRoomUseCase } from "./create-battle-room.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IStudySetRepository } from "@/clean-architecture/domain/repositories/study-set.repository.interface";
import { IReviewableItemRepository } from "@/clean-architecture/domain/repositories/reviewable-item.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { StudySetEntity } from "@/clean-architecture/domain/entities/study-set.entity";

vi.mock("@/lib/battle/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("mocked-salt:mocked-hash"),
}));

describe("CreateBattleRoomUseCase", () => {
  let useCase: CreateBattleRoomUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockStudySetRepo: IStudySetRepository;
  let mockReviewableItemRepo: IReviewableItemRepository;

  const userId = "user-123";
  const studySetPublicId = "ss-pub-123";

  const validInput = {
    userId,
    studySetPublicId,
    name: "My Battle Room",
    visibility: "public" as const,
    timeLimitSeconds: 15,
    questionCount: 10,
  };

  const studySet = new StudySetEntity(
    1, studySetPublicId, userId, "Study Set", null, "manual", null,
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

    mockStudySetRepo = {
      createStudySet: vi.fn(),
      findStudySetById: vi.fn(),
      findStudySetByPublicId: vi.fn(),
      findStudySetsByUserId: vi.fn(),
      findStudySetByVideoId: vi.fn(),
      findStudySetsByIds: vi.fn(),
      updateStudySet: vi.fn(),
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

    useCase = new CreateBattleRoomUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockStudySetRepo,
      mockReviewableItemRepo
    );
  });

  it("creates a public battle room with 4 slots", async () => {
    const room = new BattleRoomEntity(
      1, "pub-123", userId, 1, "My Battle Room", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", userId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 15, flashcards: 0 },
    });
    vi.mocked(mockRoomRepo.createBattleRoom).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.createBattleRoomSlotsBatch).mockResolvedValue(slots);

    const result = await useCase.execute(validInput);

    expect(result.room).toEqual(room);
    expect(result.slots).toEqual(slots);
    expect(mockRoomRepo.createBattleRoom).toHaveBeenCalledWith({
      hostUserId: userId,
      studySetId: 1,
      name: "My Battle Room",
      visibility: "public",
      passwordHash: null,
      timeLimitSeconds: 15,
      questionCount: 10,
    });
    expect(mockSlotRepo.createBattleRoomSlotsBatch).toHaveBeenCalledWith([
      { roomId: 1, slotIndex: 0, slotType: "player", userId, botName: null },
      { roomId: 1, slotIndex: 1, slotType: "locked", userId: null, botName: null },
      { roomId: 1, slotIndex: 2, slotType: "locked", userId: null, botName: null },
      { roomId: 1, slotIndex: 3, slotType: "locked", userId: null, botName: null },
    ]);
  });

  it("creates a private battle room with hashed password", async () => {
    const room = new BattleRoomEntity(
      2, "pub-456", userId, 1, "Private Room", "private", "mocked-salt:mocked-hash",
      "waiting", 20, 5, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const slots = [
      new BattleRoomSlotEntity(5, 2, 0, "player", userId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(6, 2, 1, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(7, 2, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(8, 2, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 10, flashcards: 0 },
    });
    vi.mocked(mockRoomRepo.createBattleRoom).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.createBattleRoomSlotsBatch).mockResolvedValue(slots);

    const result = await useCase.execute({
      ...validInput,
      visibility: "private",
      password: "secret123",
    });

    expect(result.room).toEqual(room);
    expect(mockRoomRepo.createBattleRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: "private",
        passwordHash: "mocked-salt:mocked-hash",
      })
    );
  });

  it("throws error when room name is empty", async () => {
    await expect(
      useCase.execute({ ...validInput, name: "   " })
    ).rejects.toThrow("Room name is required");

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error for invalid time limit", async () => {
    await expect(
      useCase.execute({ ...validInput, timeLimitSeconds: 25 })
    ).rejects.toThrow("Invalid time limit");

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error for invalid question count", async () => {
    await expect(
      useCase.execute({ ...validInput, questionCount: 7 })
    ).rejects.toThrow("Invalid question count");

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error when private room has no password", async () => {
    await expect(
      useCase.execute({ ...validInput, visibility: "private" })
    ).rejects.toThrow("Password is required for private rooms");

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error when user is already in an active battle room", async () => {
    const activeRoom = new BattleRoomEntity(
      5, "pub-active", "host-user", 1, "Active Room", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(
      new BattleRoomSlotEntity(1, 5, 0, "player", userId, null, "2025-01-01T00:00:00Z")
    );
    vi.mocked(mockRoomRepo.findBattleRoomById).mockResolvedValue(activeRoom);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "User is already in a battle room"
    );

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("cleans up stale slot from a finished room and proceeds", async () => {
    const finishedRoom = new BattleRoomEntity(
      5, "pub-old", userId, 1, "Old Room", "public", null,
      "finished", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const staleSlot = new BattleRoomSlotEntity(
      10, 5, 0, "player", userId, null, "2025-01-01T00:00:00Z"
    );

    const newRoom = new BattleRoomEntity(
      6, "pub-new", userId, 1, "My Battle Room", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const newSlots = [
      new BattleRoomSlotEntity(11, 6, 0, "player", userId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(12, 6, 1, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(13, 6, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(14, 6, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(staleSlot);
    vi.mocked(mockRoomRepo.findBattleRoomById).mockResolvedValue(finishedRoom);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 15, flashcards: 0 },
    });
    vi.mocked(mockRoomRepo.createBattleRoom).mockResolvedValue(newRoom);
    vi.mocked(mockSlotRepo.createBattleRoomSlotsBatch).mockResolvedValue(newSlots);

    const result = await useCase.execute(validInput);

    expect(mockRoomRepo.deleteBattleRoom).toHaveBeenCalledWith(5);
    expect(result.room).toEqual(newRoom);
  });

  it("cleans up orphaned slot when room no longer exists", async () => {
    const orphanedSlot = new BattleRoomSlotEntity(
      10, 99, 0, "player", userId, null, "2025-01-01T00:00:00Z"
    );

    const newRoom = new BattleRoomEntity(
      6, "pub-new", userId, 1, "My Battle Room", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const newSlots = [
      new BattleRoomSlotEntity(11, 6, 0, "player", userId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(12, 6, 1, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(13, 6, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(14, 6, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(orphanedSlot);
    vi.mocked(mockRoomRepo.findBattleRoomById).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 15, flashcards: 0 },
    });
    vi.mocked(mockRoomRepo.createBattleRoom).mockResolvedValue(newRoom);
    vi.mocked(mockSlotRepo.createBattleRoomSlotsBatch).mockResolvedValue(newSlots);

    const result = await useCase.execute(validInput);

    expect(mockSlotRepo.deleteSlotsByRoomId).toHaveBeenCalledWith(99);
    expect(result.room).toEqual(newRoom);
  });

  it("throws error when study set is not found", async () => {
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(null);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "Study set not found"
    );

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error when user does not own the study set", async () => {
    const otherStudySet = new StudySetEntity(
      2, studySetPublicId, "other-user", "Other Set", null, "manual", null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(otherStudySet);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      "Not authorized to use this study set"
    );

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("throws error when study set does not have enough questions", async () => {
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 5, flashcards: 0 },
    });

    await expect(
      useCase.execute({ ...validInput, questionCount: 10 })
    ).rejects.toThrow("Study set does not have enough questions");

    expect(mockRoomRepo.createBattleRoom).not.toHaveBeenCalled();
  });

  it("trims whitespace from room name", async () => {
    const room = new BattleRoomEntity(
      1, "pub-123", userId, 1, "Trimmed Name", "public", null,
      "waiting", 15, 10, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);
    vi.mocked(mockStudySetRepo.findStudySetByPublicId).mockResolvedValue(studySet);
    vi.mocked(mockReviewableItemRepo.countItemsByStudySetIdsBatch).mockResolvedValue({
      1: { questions: 15, flashcards: 0 },
    });
    vi.mocked(mockRoomRepo.createBattleRoom).mockResolvedValue(room);
    vi.mocked(mockSlotRepo.createBattleRoomSlotsBatch).mockResolvedValue([]);

    await useCase.execute({ ...validInput, name: "  Trimmed Name  " });

    expect(mockRoomRepo.createBattleRoom).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Trimmed Name" })
    );
  });
});
