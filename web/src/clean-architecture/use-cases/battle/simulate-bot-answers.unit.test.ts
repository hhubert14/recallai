import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimulateBotAnswersUseCase } from "./simulate-bot-answers.use-case";
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

describe("SimulateBotAnswersUseCase", () => {
  let useCase: SimulateBotAnswersUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockAnswerRepo: IBattleGameAnswerRepository;
  let mockQuestionRepo: IQuestionRepository;

  const hostUserId = "host-user-123";
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

    useCase = new SimulateBotAnswersUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockAnswerRepo,
      mockQuestionRepo
    );
  });

  it("simulates answers for a single bot", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    const answer = new BattleGameAnswerEntity(
      1, 1, 2, 10, 0, 2, true, "2025-01-01T00:00:02.500Z", 833
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockResolvedValue(answer);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.botAnswers).toHaveLength(1);
    expect(result.botAnswers[0].slotId).toBe(2);
    expect(mockAnswerRepo.createBattleGameAnswer).toHaveBeenCalledTimes(1);
  });

  it("simulates answers for multiple bots", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "bot", null, "Bot Beta", "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    const answer = new BattleGameAnswerEntity(
      1, 1, 2, 10, 0, 2, true, "2025-01-01T00:00:02.500Z", 833
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockResolvedValue(answer);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.botAnswers).toHaveLength(2);
    expect(mockAnswerRepo.createBattleGameAnswer).toHaveBeenCalledTimes(2);
  });

  it("returns empty array when no bots exist", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "player", "player-2", null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(3, 1, 2, "locked", null, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(4, 1, 3, "locked", null, null, "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.botAnswers).toEqual([]);
    expect(mockAnswerRepo.createBattleGameAnswer).not.toHaveBeenCalled();
  });

  it("skips bots that already answered (UNIQUE constraint violation)", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockAnswerRepo.createBattleGameAnswer).mockRejectedValue(
      new Error("duplicate key value violates unique constraint")
    );

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    // Bot already answered, so it's skipped
    expect(result.botAnswers).toEqual([]);
  });

  it("throws error when user is not the host", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ userId: "other-user", roomPublicId })
    ).rejects.toThrow("Only the host can simulate bot answers");
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when room is not in game", async () => {
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

  it("throws error when no active question", async () => {
    const roomNoQuestion = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, null, null, questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(roomNoQuestion);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("No active question");
  });
});
