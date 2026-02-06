import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteFlashcardUseCase } from "./delete-flashcard.use-case";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("DeleteFlashcardUseCase", () => {
  let useCase: DeleteFlashcardUseCase;
  let mockFlashcardRepository: IFlashcardRepository;

  beforeEach(() => {
    mockFlashcardRepository = {
      createFlashcards: vi.fn(),
      findFlashcardsByVideoId: vi.fn(),
      findFlashcardsByIds: vi.fn(),
      countFlashcardsByVideoIds: vi.fn(),
      findFlashcardById: vi.fn(),
      updateFlashcard: vi.fn(),
      deleteFlashcard: vi.fn(),
    };
    useCase = new DeleteFlashcardUseCase(mockFlashcardRepository);
  });

  it("deletes a flashcard belonging to the user", async () => {
    const flashcard = new FlashcardEntity(
      1,
      100,
      "user-123",
      "Front",
      "Back",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      flashcard
    );
    vi.mocked(mockFlashcardRepository.deleteFlashcard).mockResolvedValue(
      undefined
    );

    await useCase.execute({ flashcardId: 1, userId: "user-123" });

    expect(mockFlashcardRepository.findFlashcardById).toHaveBeenCalledWith(1);
    expect(mockFlashcardRepository.deleteFlashcard).toHaveBeenCalledWith(1);
  });

  it("deletes a flashcard without a video (manual study set)", async () => {
    const flashcard = new FlashcardEntity(
      1,
      null, // No video - manual study set
      "user-123",
      "Front",
      "Back",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      flashcard
    );
    vi.mocked(mockFlashcardRepository.deleteFlashcard).mockResolvedValue(
      undefined
    );

    await useCase.execute({ flashcardId: 1, userId: "user-123" });

    expect(mockFlashcardRepository.deleteFlashcard).toHaveBeenCalledWith(1);
  });

  it("throws error when flashcard does not exist", async () => {
    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      null
    );

    await expect(
      useCase.execute({ flashcardId: 999, userId: "user-123" })
    ).rejects.toThrow("Flashcard not found");

    expect(mockFlashcardRepository.deleteFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when flashcard belongs to different user", async () => {
    const flashcard = new FlashcardEntity(
      1,
      100,
      "other-user",
      "Someone Else's Front",
      "Someone Else's Back",
      "2025-01-25T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      flashcard
    );

    // Same error message as "not found" to avoid leaking info
    await expect(
      useCase.execute({ flashcardId: 1, userId: "user-123" })
    ).rejects.toThrow("Flashcard not found");

    expect(mockFlashcardRepository.deleteFlashcard).not.toHaveBeenCalled();
  });
});
