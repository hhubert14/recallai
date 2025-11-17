import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export interface IQuestionRepository {
    /**
     * Creates a multiple choice question with its options
     * @param videoId - The video this question belongs to
     * @param questionText - The question text
     * @param options - Array of options (must have 4 items for multiple choice)
     * @returns The created question with all options
     */
    createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            orderIndex: number;
            explanation: string | null;
        }[]
    ): Promise<MultipleChoiceQuestionEntity>;

    /**
     * Finds all questions for a video, including their options
     * @param videoId - The video ID
     * @returns Array of questions with options, sorted by creation date
     */
    findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]>;
}
