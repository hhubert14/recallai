// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionWithOptionsDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { questions, questionOptions } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export async function getQuestionsByVideoId(
    videoId: number
): Promise<QuestionWithOptionsDto[]> {
    if (!videoId) {
        return [];
    }

    // const supabase = await createServiceRoleClient();

    try {
        // const { data, error } = await supabase
        //     .from("questions")
        //     .select(
        //         `
        //         *,
        //         question_options (
        //             id,
        //             question_id,
        //             option_text,
        //             is_correct,
        //             order_index,
        //             explanation,
        //             created_at
        //         )
        //     `
        //     )
        //     .eq("video_id", videoId)
        //     .order("created_at", { ascending: true });
        // const data = await db.query.questions.findMany({
        //     where: eq(questions.videoId, videoId),
        //     with: {
        //         questionOptions: true,  // Include all options
        //     },
        // });
        const rows = await db
            .select()
            .from(questions)
            .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
            .where(eq(questions.videoId, videoId))
            .orderBy(asc(questions.createdAt))
        
        const questionsObj: Record<number, QuestionWithOptionsDto> = {}
        for (const row of rows) {
            if (!questionsObj[row.questions.id]) {
                questionsObj[row.questions.id] = {
                    ...row.questions,
                    questionOptions: [],
                }
            }
            if (row.question_options) {
                questionsObj[row.questions.id].questionOptions.push(row.question_options)
            }
        }

        const result = Object.values(questionsObj);

        result.forEach(question => {
            question.questionOptions.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        });

        return result;

        // if (error) {
        //     logger.db.error("Database query error", error, { videoId });
        //     throw error;
        // }

        // if (!data || data.length === 0) {
        //     return [];
        // }

        // Transform the data to match our DTO structure
        // const questions: QuestionDto[] = data.map(question => ({
        //     id: question.id,
        //     video_id: question.video_id,
        //     question_text: question.question_text,
        //     question_type: question.question_type,
        //     created_at: question.created_at,
        //     updated_at: question.updated_at,
        //     options: (question.question_options || []).sort(
        //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //         (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
        //     ),
        // }));

        // return questions;
    } catch (error) {
        logger.db.error("Error fetching questions by video ID", error, {
            videoId,
        });
        return [];
    }
}
