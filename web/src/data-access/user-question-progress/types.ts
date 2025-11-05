import { userQuestionProgress } from "@/drizzle/schema";

export type CreateUserQuestionProgressDto = typeof userQuestionProgress.$inferInsert;
export type UpdateUserQuestionProgressDto = Partial<Omit<typeof userQuestionProgress.$inferInsert, 'userId' | 'questionId'>>;
export type UserQuestionProgressDto = typeof userQuestionProgress.$inferSelect;

export type QuestionForReviewDto = {
    id: number;
    questionId: number;
    questionText: string;
    videoId: number;
    videoTitle: string;
    boxLevel: number;
    nextReviewDate: string | null;
    options: {
        id: number;
        optionText: string;
        isCorrect: boolean;
        explanation: string | null;
    }[];
};
