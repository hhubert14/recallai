import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";

export async function getRandomAnsweredQuestions(
    userId: string, 
    limit: number = 5
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        // Get random questions that the user has answered (whether in spaced repetition or not)
        const { data, error } = await supabase
            .from("questions")
            .select(`
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
                ),
                user_answers!inner (
                    id,
                    user_id
                ),
                user_question_progress (
                    id,
                    box_level,
                    next_review_date
                )
            `)
            .eq("videos.user_id", userId)
            .eq("user_answers.user_id", userId)
            .is("videos.deleted_at", null)
            .limit(limit * 3) // Get more than needed for better randomization
            .order("created_at", { ascending: false }); // Prefer newer questions

        if (error) {
            logger.db.error("Database query error for random answered questions", error, { userId });
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Remove duplicates (since a user might have answered the same question multiple times)
        const uniqueQuestions = data.reduce((acc: any[], current: any) => {
            const existing = acc.find(q => q.id === current.id);
            if (!existing) {
                acc.push(current);
            }
            return acc;
        }, []);

        // Shuffle and take the limit
        const shuffled = uniqueQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        // Transform to our DTO structure
        const randomQuestions: QuestionForReviewDto[] = shuffled.map((question: any) => {
            const progress = question.user_question_progress?.[0]; // May or may not exist
            
            return {
                id: progress?.id || 0,
                question_id: question.id,
                question_text: question.question_text,
                video_id: question.video_id,
                video_title: question.videos.title,
                box_level: progress?.box_level || 1,
                next_review_date: progress?.next_review_date || null,
                options: question.question_options.map((option: any) => ({
                    id: option.id,
                    option_text: option.option_text,
                    is_correct: option.is_correct,
                    explanation: option.explanation
                }))
            };
        });

        return randomQuestions;
    } catch (error) {
        logger.db.error("Error fetching random answered questions", error, { userId });
        return [];
    }
}
