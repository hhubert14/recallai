import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionDto } from "./types";
import { logger } from "@/lib/logger";

export async function getQuestionsByVideoId(
    videoId: number
): Promise<QuestionDto[]> {
    if (!videoId) {
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("questions")
            .select(
                `
                *,
                question_options (
                    id,
                    question_id,
                    option_text,
                    is_correct,
                    order_index,
                    explanation,
                    created_at
                )
            `
            )
            .eq("video_id", videoId)
            .order("created_at", { ascending: true });

        if (error) {
            logger.db.error("Database query error", error, { videoId });
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Transform the data to match our DTO structure
        const questions: QuestionDto[] = data.map(question => ({
            id: question.id,
            video_id: question.video_id,
            question_text: question.question_text,
            question_type: question.question_type,
            created_at: question.created_at,
            updated_at: question.updated_at,
            options: (question.question_options || []).sort(
                (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
            ),
        }));

        return questions;
    } catch (error) {
        logger.db.error("Error fetching questions by video ID", error, {
            videoId,
        });
        return [];
    }
}
