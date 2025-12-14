export type GeneratedFlashcardDto = {
    front: string;
    back: string;
};

export type GeneratedFlashcardsDto = {
    flashcards: GeneratedFlashcardDto[];
};

export interface IFlashcardGeneratorService {
    generate(
        title: string,
        transcript: string,
        count: number
    ): Promise<GeneratedFlashcardsDto | undefined>;
}
