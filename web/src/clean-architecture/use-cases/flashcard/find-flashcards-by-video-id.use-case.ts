import { IFlashcardRepository } from "@/clean-architecture/domain/repositories/flashcard.repository.interface";
import { FlashcardEntity } from "@/clean-architecture/domain/entities/flashcard.entity";

export class FindFlashcardsByVideoIdUseCase {
    constructor(
        private readonly flashcardRepository: IFlashcardRepository
    ) {}

    async execute(videoId: number): Promise<FlashcardEntity[]> {
        return this.flashcardRepository.findFlashcardsByVideoId(videoId);
    }
}
