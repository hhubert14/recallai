import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";

export async function getQuestionsDueForReview(
    userId: string
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        const { data, error } = await supabase
            .from("user_question_progress")
            .select(
                `
                id,
                question_id,
                box_level,
                next_review_date,
                questions!inner (
                    id,
                    question_text,
                    video_id,
                    videos!inner (
                        id,
                        title,
                        user_id,
                        deleted_at
                    ),
                    question_options (
                        id,
                        option_text,
                        is_correct,
                        explanation
                    )
                )
            `
            )
            .eq("user_id", userId)
            .lte("next_review_date", today)
            .not("next_review_date", "is", null)
            .eq("questions.videos.user_id", userId)
            .is("questions.videos.deleted_at", null)
            .order("next_review_date", { ascending: true });

        if (error) {
            logger.db.error("Database query error", error, { userId });
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Transform the data to match our DTO structure
        const questionsForReview: QuestionForReviewDto[] = data.map(
            (progress: any) => ({
                id: progress.id,
                question_id: progress.question_id,
                question_text: progress.questions.question_text,
                video_id: progress.questions.video_id,
                video_title: progress.questions.videos.title,
                box_level: progress.box_level,
                next_review_date: progress.next_review_date,
                options: progress.questions.question_options.map(
                    (option: any) => ({
                        id: option.id,
                        option_text: option.option_text,
                        is_correct: option.is_correct,
                        explanation: option.explanation,
                    })
                ),
            })
        );

        return questionsForReview;
    } catch (error) {
        logger.db.error("Error fetching questions due for review", error, {
            userId,
        });
        return [];
    }
}
