import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export interface EditFlashcardInput {
    userId: string;
    flashcardId: number;
    front: string;
    back: string;
}

export class EditFlashcardUseCase {
    constructor(private readonly flashcardRepository: IFlashcardRepository) {}

    async execute(input: EditFlashcardInput): Promise<FlashcardEntity> {
        const { userId, flashcardId, front, back } = input;

        // Find the flashcard
        const flashcard = await this.flashcardRepository.findFlashcardById(flashcardId);
        if (!flashcard) {
            throw new Error("Flashcard not found");
        }

        // Verify ownership
        if (flashcard.userId !== userId) {
            throw new Error("Not authorized to edit this flashcard");
        }

        // Validate inputs
        if (!front.trim()) {
            throw new Error("Front of flashcard cannot be empty");
        }
        if (!back.trim()) {
            throw new Error("Back of flashcard cannot be empty");
        }
        if (front.length > 500) {
            throw new Error("Front of flashcard cannot exceed 500 characters");
        }
        if (back.length > 2000) {
            throw new Error("Back of flashcard cannot exceed 2000 characters");
        }

        // Update the flashcard
        return this.flashcardRepository.updateFlashcard(flashcardId, front, back);
    }
}
