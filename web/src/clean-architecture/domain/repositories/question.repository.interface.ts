import { MultipleChoiceQuestionEntity } from "@/clean-architecture/domain/entities/question.entity";

export interface IQuestionRepository {
    createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }[],
        sourceQuote: string | null,
        sourceTimestamp: number | null
    ): Promise<MultipleChoiceQuestionEntity>;

    findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null>;

    findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]>;

    /**
     * Find all questions for a user (across all their videos).
     * Used for "new" and "random" study modes.
     */
    findQuestionsByUserId(userId: string): Promise<MultipleChoiceQuestionEntity[]>;

    /**
     * Find questions by their IDs.
     * Used to fetch full question data after getting progress records.
     */
    findQuestionsByIds(questionIds: number[]): Promise<MultipleChoiceQuestionEntity[]>;

    /**
     * Count questions grouped by video ID.
     * Returns a map of videoId -> count.
     */
    countQuestionsByVideoIds(videoIds: number[]): Promise<Record<number, number>>;
}
