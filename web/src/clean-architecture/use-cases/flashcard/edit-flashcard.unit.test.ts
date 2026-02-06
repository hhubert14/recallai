import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditFlashcardUseCase } from "./edit-flashcard.use-case";
import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

describe("EditFlashcardUseCase", () => {
  let useCase: EditFlashcardUseCase;
  let mockFlashcardRepository: IFlashcardRepository;

  const userId = "user-123";
  const flashcardId = 100;

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

    useCase = new EditFlashcardUseCase(mockFlashcardRepository);
  });

  it("updates a flashcard successfully", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Old front",
      "Old back",
      "2025-01-20T10:00:00Z"
    );

    const updatedFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "New front",
      "New back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );
    vi.mocked(mockFlashcardRepository.updateFlashcard).mockResolvedValue(
      updatedFlashcard
    );

    const result = await useCase.execute({
      userId,
      flashcardId,
      front: "New front",
      back: "New back",
    });

    expect(result).toEqual(updatedFlashcard);
    expect(mockFlashcardRepository.findFlashcardById).toHaveBeenCalledWith(
      flashcardId
    );
    expect(mockFlashcardRepository.updateFlashcard).toHaveBeenCalledWith(
      flashcardId,
      "New front",
      "New back"
    );
  });

  it("updates a flashcard with videoId", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      42, // has videoId
      userId,
      "Old front",
      "Old back",
      "2025-01-20T10:00:00Z"
    );

    const updatedFlashcard = new FlashcardEntity(
      flashcardId,
      42,
      userId,
      "Updated front",
      "Updated back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );
    vi.mocked(mockFlashcardRepository.updateFlashcard).mockResolvedValue(
      updatedFlashcard
    );

    const result = await useCase.execute({
      userId,
      flashcardId,
      front: "Updated front",
      back: "Updated back",
    });

    expect(result).toEqual(updatedFlashcard);
  });

  it("throws error when flashcard does not exist", async () => {
    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      null
    );

    await expect(
      useCase.execute({
        userId,
        flashcardId: 999,
        front: "New front",
        back: "New back",
      })
    ).rejects.toThrow("Flashcard not found");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when user does not own the flashcard", async () => {
    const otherUserFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      "other-user-456",
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      otherUserFlashcard
    );

    await expect(
      useCase.execute({
        userId,
        flashcardId,
        front: "New front",
        back: "New back",
      })
    ).rejects.toThrow("Not authorized to edit this flashcard");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when front is empty", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );

    await expect(
      useCase.execute({
        userId,
        flashcardId,
        front: "   ",
        back: "New back",
      })
    ).rejects.toThrow("Front of flashcard cannot be empty");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when back is empty", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );

    await expect(
      useCase.execute({
        userId,
        flashcardId,
        front: "New front",
        back: "",
      })
    ).rejects.toThrow("Back of flashcard cannot be empty");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when front exceeds 500 characters", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );

    const longFront = "a".repeat(501);

    await expect(
      useCase.execute({
        userId,
        flashcardId,
        front: longFront,
        back: "New back",
      })
    ).rejects.toThrow("Front of flashcard cannot exceed 500 characters");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("throws error when back exceeds 2000 characters", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );

    const longBack = "a".repeat(2001);

    await expect(
      useCase.execute({
        userId,
        flashcardId,
        front: "New front",
        back: longBack,
      })
    ).rejects.toThrow("Back of flashcard cannot exceed 2000 characters");

    expect(mockFlashcardRepository.updateFlashcard).not.toHaveBeenCalled();
  });

  it("accepts front with exactly 500 characters", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    const updatedFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "a".repeat(500),
      "New back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );
    vi.mocked(mockFlashcardRepository.updateFlashcard).mockResolvedValue(
      updatedFlashcard
    );

    const result = await useCase.execute({
      userId,
      flashcardId,
      front: "a".repeat(500),
      back: "New back",
    });

    expect(result).toEqual(updatedFlashcard);
  });

  it("accepts back with exactly 2000 characters", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    const updatedFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "New front",
      "a".repeat(2000),
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );
    vi.mocked(mockFlashcardRepository.updateFlashcard).mockResolvedValue(
      updatedFlashcard
    );

    const result = await useCase.execute({
      userId,
      flashcardId,
      front: "New front",
      back: "a".repeat(2000),
    });

    expect(result).toEqual(updatedFlashcard);
  });

  it("trims whitespace from front and back before saving", async () => {
    const existingFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Front",
      "Back",
      "2025-01-20T10:00:00Z"
    );

    const updatedFlashcard = new FlashcardEntity(
      flashcardId,
      null,
      userId,
      "Trimmed front",
      "Trimmed back",
      "2025-01-20T10:00:00Z"
    );

    vi.mocked(mockFlashcardRepository.findFlashcardById).mockResolvedValue(
      existingFlashcard
    );
    vi.mocked(mockFlashcardRepository.updateFlashcard).mockResolvedValue(
      updatedFlashcard
    );

    await useCase.execute({
      userId,
      flashcardId,
      front: "  Trimmed front  ",
      back: "  Trimmed back  ",
    });

    expect(mockFlashcardRepository.updateFlashcard).toHaveBeenCalledWith(
      flashcardId,
      "Trimmed front",
      "Trimmed back"
    );
  });
});
