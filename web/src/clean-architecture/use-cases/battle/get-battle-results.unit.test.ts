import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBattleResultsUseCase } from "./get-battle-results.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IBattleRoomSlotRepository } from "@/clean-architecture/domain/repositories/battle-room-slot.repository.interface";
import { IBattleGameAnswerRepository } from "@/clean-architecture/domain/repositories/battle-game-answer.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import { BattleRoomSlotEntity } from "@/clean-architecture/domain/entities/battle-room-slot.entity";
import { BattleGameAnswerEntity } from "@/clean-architecture/domain/entities/battle-game-answer.entity";

describe("GetBattleResultsUseCase", () => {
  let useCase: GetBattleResultsUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockSlotRepo: IBattleRoomSlotRepository;
  let mockAnswerRepo: IBattleGameAnswerRepository;

  const roomPublicId = "room-pub-123";
  const hostUserId = "host-user-123";
  const questionIds = [10, 20, 30];

  const finishedRoom = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
    "finished", 15, 3, null, null, questionIds,
    "2025-01-01T00:00:00Z", "2025-01-01T00:00:30Z"
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

    mockAnswerRepo = {
      createBattleGameAnswer: vi.fn(),
      findAnswersByRoomId: vi.fn(),
      findAnswersBySlotIdAndRoomId: vi.fn(),
      findAnswersByRoomIdAndQuestionIndex: vi.fn(),
      countAnswersByRoomIdAndQuestionIndex: vi.fn(),
    };

    useCase = new GetBattleResultsUseCase(
      mockRoomRepo,
      mockSlotRepo,
      mockAnswerRepo
    );
  });

  it("returns ranked results with player and bot info", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
      new BattleRoomSlotEntity(2, 1, 1, "bot", null, "Bot Alpha", "2025-01-01T00:00:00Z"),
    ];

    const answers = [
      // Host: 2 correct, total score 1400
      new BattleGameAnswerEntity(1, 1, 1, 10, 0, 1, true, "2025-01-01T00:00:02.000Z", 800),
      new BattleGameAnswerEntity(2, 1, 1, 20, 1, 2, true, "2025-01-01T00:00:04.000Z", 600),
      // Bot: 1 correct, total score 500
      new BattleGameAnswerEntity(3, 1, 2, 10, 0, 3, true, "2025-01-01T00:00:05.000Z", 500),
      new BattleGameAnswerEntity(4, 1, 2, 20, 1, 4, false, "2025-01-01T00:00:06.000Z", 0),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(finishedRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockAnswerRepo.findAnswersByRoomId).mockResolvedValue(answers);

    const result = await useCase.execute({ roomPublicId });

    expect(result.room).toEqual(finishedRoom);
    expect(result.results).toHaveLength(2);

    // Host ranks first
    expect(result.results[0]).toEqual({
      rank: 1,
      slotIndex: 0,
      userId: hostUserId,
      botName: null,
      totalScore: 1400,
      correctCount: 2,
      totalQuestions: 2,
    });

    // Bot ranks second
    expect(result.results[1]).toEqual({
      rank: 2,
      slotIndex: 1,
      userId: null,
      botName: "Bot Alpha",
      totalScore: 500,
      correctCount: 1,
      totalQuestions: 2,
    });
  });

  it("handles single player results", async () => {
    const slots = [
      new BattleRoomSlotEntity(1, 1, 0, "player", hostUserId, null, "2025-01-01T00:00:00Z"),
    ];

    const answers = [
      new BattleGameAnswerEntity(1, 1, 1, 10, 0, 1, true, "2025-01-01T00:00:03.000Z", 700),
    ];

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(finishedRoom);
    vi.mocked(mockSlotRepo.findSlotsByRoomId).mockResolvedValue(slots);
    vi.mocked(mockAnswerRepo.findAnswersByRoomId).mockResolvedValue(answers);

    const result = await useCase.execute({ roomPublicId });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].rank).toBe(1);
    expect(result.results[0].userId).toBe(hostUserId);
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when game has not finished", async () => {
    const inGameRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 0, "2025-01-01T00:00:00Z", questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ roomPublicId })
    ).rejects.toThrow("Game has not finished yet");
  });
});
