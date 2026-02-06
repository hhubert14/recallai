import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";

export interface DeleteFlashcardInput {
  flashcardId: number;
  userId: string;
}

export class DeleteFlashcardUseCase {
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(input: DeleteFlashcardInput): Promise<void> {
    const flashcard = await this.flashcardRepository.findFlashcardById(
      input.flashcardId
    );

    // Return same error for both "not found" and "wrong user" to avoid leaking info
    if (!flashcard || flashcard.userId !== input.userId) {
      throw new Error("Flashcard not found");
    }

    await this.flashcardRepository.deleteFlashcard(input.flashcardId);
  }
}
