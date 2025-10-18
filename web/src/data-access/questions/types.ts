export type CreateQuestionDto = {
    video_id: number;
    question_text: string;
    question_type: string;
};

export type QuestionOptionDto = {
    id: number;
    question_id: number;
    option_text: string;
    is_correct: boolean;
    order_index: number | null;
    explanation: string | null;
    created_at: string;
};

export type QuestionDto = {
    id: number;
    video_id: number;
    question_text: string;
    question_type: string;
    created_at: string;
    updated_at: string;
    options: QuestionOptionDto[];
};
