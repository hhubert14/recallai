export type CreateUserAnswerDto = {
    user_id: string;
    question_id: number;
    selected_option_id: number;
    text_answer?: string;
    is_correct: boolean;
};

export type UserAnswerDto = {
    id: number;
    user_id: string;
    question_id: number;
    selected_option_id: number;
    text_answer: string | null;
    is_correct: boolean;
    created_at: string;
};
