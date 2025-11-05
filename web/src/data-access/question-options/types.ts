import { questionOptions } from "@/drizzle/schema";

// export type CreateQuestionOptionsDto = {
//     question_id: number;
//     option_text: string;
//     is_correct: boolean;
//     order_index?: number;
//     explanation?: string;
// };

export type CreateQuestionOptionsDto = typeof questionOptions.$inferInsert
