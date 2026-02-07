import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SubmitBattleAnswerUseCase } from "./submit-battle-answer.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { BattleGameAnswerEntity } from "@/clean-architecture/domain/entities/battle-game-answer.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";

describe("SubmitBattleAnswerUseCase", () => {
  let useCase: SubmitBattleAnswerUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockAnswerRepo: IBattleGameAnswerRepository;
  let mockQuestionRepo: IQuestionRepository;

  const userId = "player-123";
  const roomPublicId = "room-pub-123";
  const questionIds = [10, 20, 30];

  const inGameRoom = new BattleRoomEntity(
    1, roomPublicId, "host-user", 1, "Test Room", "public", null,
    "in_game", 15, 3, 0, "2025-01-01T00:00:00.000Z", questionIds,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const playerSlot = new BattleRoomSlotEntity(
    2, 1, 1, "player", userId, null, "2025-01-01T00:00:00Z"
  );

  const question = new MultipleChoiceQuestionEntity(10, null, "What is 2+2?", [
    new MultipleChoiceOption(1, "3", false, null),
    new MultipleChoiceOption(2, "4", true, "Correct!"),
    new MultipleChoiceOption(3, "5", false, null),
    new MultipleChoiceOption(4, "6", false, null),
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:05.000Z"));

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

    mockAnswerRepo = {
      createBattleGameAnswer: vi.fn(),
      findAnswersByRoomId: vi.fn(),
      findAnswersBySlotIdAndRoomId: vi.fn(),
      countAnswersByRoomIdAndQuestionIndex: vi.fn(),
    };

    mockQuestionRepo = {
      createMultipleChoiceQuestion: vi.fn(),
      findQuestionById: vi.fn(),
      findQuestionsByVideoId: vi.fn(),
      findQuestionsByIds: vi.fn(),
      countQuestionsByVideoIds: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
    };

    useCase = new SubmitBattleAnswerUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockAnswerRepo,
      mockQuestionRepo
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("submits a correct answer with calculated score", async () => {
    const answer = new BattleGameAnswerEntity(
      1, 1, 2, 10, 0, 2, true, "2025-01-01T00:00:05.000Z", 667
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(playerSlot);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockResolvedValue(answer);

    const result = await useCase.execute({
      userId,
      roomPublicId,
      selectedOptionId: 2,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBeGreaterThan(0);
    expect(mockAnswerRepo.createBattleGameAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: 1,
        slotId: 2,
        questionId: 10,
        questionIndex: 0,
        selectedOptionId: 2,
        isCorrect: true,
      })
    );
  });

  it("submits a wrong answer with score 0", async () => {
    const answer = new BattleGameAnswerEntity(
      1, 1, 2, 10, 0, 1, false, "2025-01-01T00:00:05.000Z", 0
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(playerSlot);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockResolvedValue(answer);

    const result = await useCase.execute({
      userId,
      roomPublicId,
      selectedOptionId: 1, // wrong option
    });

    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(mockAnswerRepo.createBattleGameAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        isCorrect: false,
        score: 0,
      })
    );
  });

  it("throws error when already answered (UNIQUE constraint violation)", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(playerSlot);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockRejectedValue(
      new Error("duplicate key value violates unique constraint")
    );

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("Already answered this question");
  });

  it("throws error when user is not a participant", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("User is not a participant in this battle");
  });

  it("throws error when slot is in a different room", async () => {
    const slotInDifferentRoom = new BattleRoomSlotEntity(
      2, 99, 1, "player", userId, null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slotInDifferentRoom);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("User is not a participant in this battle");
  });

  it("throws error when no active question", async () => {
    const roomNoQuestion = new BattleRoomEntity(
      1, roomPublicId, "host-user", 1, "Test Room", "public", null,
      "in_game", 15, 3, null, null, questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(roomNoQuestion);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(playerSlot);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("No active question");
  });

  it("throws error for invalid option ID", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(playerSlot);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 999 })
    ).rejects.toThrow("Invalid option");
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when room is not in game", async () => {
    const waitingRoom = new BattleRoomEntity(
      1, roomPublicId, "host-user", 1, "Test Room", "public", null,
      "waiting", 15, 3, null, null, null,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(waitingRoom);

    await expect(
      useCase.execute({ userId, roomPublicId, selectedOptionId: 2 })
    ).rejects.toThrow("Battle room is not in game");
  });
});
