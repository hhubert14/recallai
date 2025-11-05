// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { questions, videos, questionOptions, userQuestionProgress } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getRandomQuestionsForReview(
    userId: string,
    limit: number = 10
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    // const supabase = await createServiceRoleClient();

    try {
        // Get questions from user's videos with their progress and options
        const rows = await db
            .select()
            .from(questions)
            .innerJoin(videos, eq(questions.videoId, videos.id))
            .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
            .leftJoin(
                userQuestionProgress,
                and(
                    eq(userQuestionProgress.questionId, questions.id),
                    eq(userQuestionProgress.userId, userId)
                )
            )
            .where(eq(videos.userId, userId))
            .orderBy(desc(questions.createdAt))
            .limit(limit * 3); // Get more than needed for better randomization

        if (!rows || rows.length === 0) {
            return [];
        }

        // Group by question and collect options
        type ProgressData = {
            id: number;
            userId: string;
            questionId: number;
            boxLevel: number | null;
            nextReviewDate: string | null;
            timesCorrect: number | null;
            timesIncorrect: number | null;
            lastReviewedAt: string | null;
            createdAt: string;
            updatedAt: string;
        };
        type QuestionData = {
            questionId: number;
            questionText: string;
            videoId: number;
            videoTitle: string;
            progress: ProgressData | null;
            options: Array<{
                id: number;
                optionText: string;
                isCorrect: boolean;
                explanation: string | null;
            }>;
        };
        const questionsMap: Record<number, QuestionData> = {};

        for (const row of rows) {
            const questionId = row.questions.id;

            if (!questionsMap[questionId]) {
                questionsMap[questionId] = {
                    questionId: row.questions.id,
                    questionText: row.questions.questionText,
                    videoId: row.questions.videoId,
                    videoTitle: row.videos.title,
                    progress: row.user_question_progress,
                    options: []
                };
            }

            if (row.question_options) {
                questionsMap[questionId].options.push({
                    id: row.question_options.id,
                    optionText: row.question_options.optionText,
                    isCorrect: row.question_options.isCorrect,
                    explanation: row.question_options.explanation,
                });
            }
        }

        // Filter to only include questions that have progress (have been answered before)
        const questionsWithProgress = Object.values(questionsMap).filter(
            (q) => q.progress !== null
        );

        // Shuffle and take the limit
        const shuffled = questionsWithProgress
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        // Transform to DTO structure
        const randomQuestions: QuestionForReviewDto[] = shuffled.map((question) => ({
            id: question.progress?.id || 0,
            questionId: question.questionId,
            questionText: question.questionText,
            videoId: question.videoId,
            videoTitle: question.videoTitle,
            boxLevel: question.progress?.boxLevel || 1,
            nextReviewDate: question.progress?.nextReviewDate || null,
            options: question.options,
        }));

        return randomQuestions;
    } catch (error) {
        logger.db.error("Error fetching random questions for review", error, {
            userId,
        });
        return [];
    }
}
