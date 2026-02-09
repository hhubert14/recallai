import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuestionResultsUseCase } from "./get-question-results.use-case";
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

describe("GetQuestionResultsUseCase", () => {
  let useCase: GetQuestionResultsUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockAnswerRepo: IBattleGameAnswerRepository;
  let mockQuestionRepo: IQuestionRepository;

  const hostUserId = "host-user-123";
  const playerUserId = "player-user-456";
  const roomPublicId = "room-pub-123";
  const questionIds = [10, 20, 30];
  const startedAt = "2025-01-01T00:00:00.000Z";

  const inGameRoom = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
    "in_game", 15, 3, 0, startedAt, questionIds,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
  );

  const question = new MultipleChoiceQuestionEntity(10, null, "What is 2+2?", [
    new MultipleChoiceOption(1, "3", false, null),
    new MultipleChoiceOption(2, "4", true, "Correct!"),
    new MultipleChoiceOption(3, "5", false, null),
    new MultipleChoiceOption(4, "6", false, null),
  ]);

  const slots = [
    new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(2, 1, 1, "player", playerUserId, null, "2025-01-01T00:00:00Z"),
    new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
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

    mockAnswerRepo = {
      createBattleGameAnswer: vi.fn(),
      findAnswersByRoomId: vi.fn(),
      findAnswersBySlotIdAndRoomId: vi.fn(),
      findAnswersByRoomIdAndQuestionIndex: vi.fn(),
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

    useCase = new GetQuestionResultsUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockAnswerRepo,
      mockQuestionRepo
    );
  });

  it("returns question results with correct option and per-slot results", async () => {
    const answers = [
      new BattleGameAnswerEntity(1, 1, 1, 10, 0, 2, true, "2025-01-01T00:00:03.000Z", 800),
      new BattleGameAnswerEntity(2, 1, 2, 10, 0, 1, false, "2025-01-01T00:00:05.000Z", 0),
      new BattleGameAnswerEntity(3, 1, 3, 10, 0, 2, true, "2025-01-01T00:00:02.000Z", 867),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slots[0]);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.findAnswersByRoomIdAndQuestionIndex).mockResolvedValue(answers);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.questionIndex).toBe(0);
    expect(result.correctOptionId).toBe(2);
    expect(result.results).toHaveLength(3);

    // Host (slot 0): correct
    expect(result.results[0]).toEqual({
      slotIndex: 0,
      userId: hostUserId,
      botName: null,
      selectedOptionId: 2,
      isCorrect: true,
      score: 800,
    });

    // Player (slot 1): incorrect
    expect(result.results[1]).toEqual({
      slotIndex: 1,
      userId: playerUserId,
      botName: null,
      selectedOptionId: 1,
      isCorrect: false,
      score: 0,
    });

    // Bot (slot 2): correct
    expect(result.results[2]).toEqual({
      slotIndex: 2,
      userId: null,
      botName: "Bot Alpha",
      selectedOptionId: 2,
      isCorrect: true,
      score: 867,
    });
  });

  it("returns empty results when no answers submitted", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slots[0]);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.findAnswersByRoomIdAndQuestionIndex).mockResolvedValue([]);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.questionIndex).toBe(0);
    expect(result.correctOptionId).toBe(2);
    expect(result.results).toEqual([]);
  });

  it("throws when room not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws when room is not in game", async () => {
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

  it("throws when user is not a participant", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: "random-user", roomPublicId })
    ).rejects.toThrow("User is not a participant in this battle");
  });

  it("throws when user's slot is in a different room", async () => {
    const wrongRoomSlot = new BattleRoomSlotEntity(
      99, 999, 0, "player", "random-user", null, "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(wrongRoomSlot);

    await expect(
      useCase.execute({ userId: "random-user", roomPublicId })
    ).rejects.toThrow("User is not a participant in this battle");
  });

  it("throws when question index is out of bounds", async () => {
    // Room has questionIds [10, 20, 30] but currentQuestionIndex is 5
    const outOfBoundsRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 5, startedAt, questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(outOfBoundsRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slots[0]);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Question index out of bounds");
  });

  it("skips answers with missing slots", async () => {
    // Answer with slotId 999 doesn't match any slot
    const answers = [
      new BattleGameAnswerEntity(1, 1, 1, 10, 0, 2, true, "2025-01-01T00:00:03.000Z", 800),
      new BattleGameAnswerEntity(2, 1, 999, 10, 0, 1, false, "2025-01-01T00:00:05.000Z", 0),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slots[0]);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.findAnswersByRoomIdAndQuestionIndex).mockResolvedValue(answers);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    // Only the answer with a matching slot should be included
    expect(result.results).toHaveLength(1);
    expect(result.results[0].slotIndex).toBe(0);
    expect(result.results[0].score).toBe(800);
  });

  it("throws when no active question", async () => {
    const roomNoQuestion = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, null, null, questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(roomNoQuestion);
    vi.mocked(mockSlotRepo.findSlotByUserId).mockResolvedValue(slots[0]);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("No active question");
  });
});
