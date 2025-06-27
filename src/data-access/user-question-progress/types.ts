export type CreateUserQuestionProgressDto = {
    user_id: string;
    question_id: number;
    box_level?: number;
    next_review_date?: string; // ISO date string
    times_correct?: number;
    times_incorrect?: number;
    last_reviewed_at?: string; // ISO datetime string
};

export type UpdateUserQuestionProgressDto = {
    box_level?: number;
    next_review_date?: string;
    times_correct?: number;
    times_incorrect?: number;
    last_reviewed_at?: string;
};

export type UserQuestionProgressDto = {
    id: number;
    user_id: string;
    question_id: number;
    box_level: number;
    next_review_date: string | null;
    times_correct: number;
    times_incorrect: number;
    last_reviewed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type QuestionForReviewDto = {
    id: number;
    question_id: number;
    question_text: string;
    video_id: number;
    video_title: string;
    box_level: number;
    next_review_date: string | null;
    options: {
        id: number;
        option_text: string;
        is_correct: boolean;
        explanation: string | null;
    }[];
};
