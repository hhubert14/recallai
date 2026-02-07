import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdvanceQuestionUseCase } from "./advance-question.use-case";
import { IBattleRoomRepository } from "@/clean-architecture/domain/repositories/battle-room.repository.interface";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { BattleRoomEntity } from "@/clean-architecture/domain/entities/battle-room.entity";
import {
  MultipleChoiceQuestionEntity,
  MultipleChoiceOption,
} from "@/clean-architecture/domain/entities/question.entity";

describe("AdvanceQuestionUseCase", () => {
  let useCase: AdvanceQuestionUseCase;
  let mockRoomRepo: IBattleRoomRepository;
  let mockQuestionRepo: IQuestionRepository;

  const hostUserId = "host-user-123";
  const roomPublicId = "room-pub-123";
  const questionIds = [10, 20, 30];

  const inGameRoom = new BattleRoomEntity(
    1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
    "in_game", 15, 3, null, null, questionIds,
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

    mockQuestionRepo = {
      createMultipleChoiceQuestion: vi.fn(),
      findQuestionById: vi.fn(),
      findQuestionsByVideoId: vi.fn(),
      findQuestionsByIds: vi.fn(),
      countQuestionsByVideoIds: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
    };

    useCase = new AdvanceQuestionUseCase(mockRoomRepo, mockQuestionRepo);
  });

  it("advances from null to first question (index 0)", async () => {
    const updatedRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 0, "2025-01-01T00:00:01.000Z", questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:01Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question);
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(updatedRoom);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.questionIndex).toBe(0);
    expect(result.questionId).toBe(10);
    expect(result.questionText).toBe("What is 2+2?");
    // Options should NOT have isCorrect
    for (const opt of result.options) {
      expect(opt).not.toHaveProperty("isCorrect");
    }
    expect(result.options).toHaveLength(4);
    expect(result.options[0]).toEqual({ id: 1, optionText: "3" });
  });

  it("advances from question 0 to question 1", async () => {
    const roomAtQ0 = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 0, "2025-01-01T00:00:00Z", questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    const question2 = new MultipleChoiceQuestionEntity(20, null, "Capital of France?", [
      new MultipleChoiceOption(5, "London", false, null),
      new MultipleChoiceOption(6, "Paris", true, null),
      new MultipleChoiceOption(7, "Berlin", false, null),
      new MultipleChoiceOption(8, "Madrid", false, null),
    ]);

    const updatedRoom = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 1, "2025-01-01T00:00:05.000Z", questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:05Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(roomAtQ0);
    vi.mocked(mockQuestionRepo.findQuestionById).mockResolvedValue(question2);
    vi.mocked(mockRoomRepo.updateBattleRoom).mockResolvedValue(updatedRoom);

    const result = await useCase.execute({ userId: hostUserId, roomPublicId });

    expect(result.questionIndex).toBe(1);
    expect(result.questionId).toBe(20);
    expect(result.questionText).toBe("Capital of France?");
  });

  it("throws error when trying to advance past last question", async () => {
    const roomAtLastQ = new BattleRoomEntity(
      1, roomPublicId, hostUserId, 1, "Test Room", "public", null,
      "in_game", 15, 3, 2, "2025-01-01T00:00:00Z", questionIds,
      "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z"
    );

    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(roomAtLastQ);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("No more questions");
  });

  it("throws error when room is not found", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: hostUserId, roomPublicId })
    ).rejects.toThrow("Battle room not found");
  });

  it("throws error when user is not the host", async () => {
    vi.mocked(mockRoomRepo.findBattleRoomByPublicId).mockResolvedValue(inGameRoom);

    await expect(
      useCase.execute({ userId: "other-user", roomPublicId })
    ).rejects.toThrow("Only the host can advance questions");
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
});
