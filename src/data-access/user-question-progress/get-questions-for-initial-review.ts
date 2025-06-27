import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";

export async function getQuestionsForInitialReview(
    userId: string, 
    limit: number = 10
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        // First get questions that have been answered by this user
        const { data: answeredQuestions, error: answersError } = await supabase
            .from("user_answers")
            .select(`
                question_id,
                questions (
                    id,
                    question_text,
                    video_id,
                    videos (
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
            `)
            .eq("user_id", userId)
            .eq("questions.videos.user_id", userId)
            .is("questions.videos.deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(50); // Get more to filter from

        if (answersError) {
            logger.db.error("Database query error for answered questions", answersError, { userId });
            throw answersError;
        }

        if (!answeredQuestions || answeredQuestions.length === 0) {
            return [];
        }        // Remove duplicates and get unique questions
        const uniqueQuestions = new Map();
        for (const answer of answeredQuestions) {
            const question = answer.questions as any;
            if (question && question.id) {
                if (!uniqueQuestions.has(question.id)) {
                    uniqueQuestions.set(question.id, question);
                }
            }
        }

        // Filter out questions that are already in spaced repetition system
        const questionsNotInSR = [];
        
        for (const [questionId, question] of uniqueQuestions) {
            // Check if this question is already in spaced repetition
            const { data: existingProgress } = await supabase
                .from("user_question_progress")
                .select("id")
                .eq("user_id", userId)
                .eq("question_id", questionId)
                .single();

            // Only include if not in spaced repetition yet
            if (!existingProgress) {
                questionsNotInSR.push(question);
            }
        }

        // Transform to our DTO structure
        const initialReviewQuestions: QuestionForReviewDto[] = questionsNotInSR.slice(0, limit).map((question: any) => ({
            id: 0, // No progress record yet
            question_id: question.id,
            question_text: question.question_text,
            video_id: question.video_id,
            video_title: question.videos.title,
            box_level: 1, // Will start at box 1
            next_review_date: null, // Will be set after first review
            options: question.question_options.map((option: any) => ({
                id: option.id,
                option_text: option.option_text,
                is_correct: option.is_correct,
                explanation: option.explanation
            }))
        }));

        return initialReviewQuestions;
    } catch (error) {
        logger.db.error("Error fetching questions for initial review", error, { userId });
        return [];
    }
}
