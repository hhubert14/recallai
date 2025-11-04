// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userQuestionProgress, questions, videos, questionOptions } from "@/drizzle/schema";
import { eq, lte, isNotNull, and, asc } from "drizzle-orm";

export async function getQuestionsDueForReview(
    userId: string
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    // const supabase = await createServiceRoleClient();

    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Get all progress records with joins
        const rows = await db
            .select()
            .from(userQuestionProgress)
            .innerJoin(questions, eq(userQuestionProgress.questionId, questions.id))
            .innerJoin(videos, eq(questions.videoId, videos.id))
            .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
            .where(
                and(
                    eq(userQuestionProgress.userId, userId),
                    lte(userQuestionProgress.nextReviewDate, today),
                    isNotNull(userQuestionProgress.nextReviewDate),
                    eq(videos.userId, userId)
                )
            )
            .orderBy(asc(userQuestionProgress.nextReviewDate));

        if (!rows || rows.length === 0) {
            return [];
        }

        // Group by progress record and collect options
        type QuestionData = {
            id: number;
            questionId: number;
            questionText: string;
            videoId: number;
            videoTitle: string;
            boxLevel: number | null;
            nextReviewDate: string | null;
            options: Array<{
                id: number;
                optionText: string;
                isCorrect: boolean;
                explanation: string | null;
            }>;
        };
        const progressMap: Record<number, QuestionData> = {};

        for (const row of rows) {
            const progressId = row.user_question_progress.id;

            if (!progressMap[progressId]) {
                progressMap[progressId] = {
                    id: row.user_question_progress.id,
                    questionId: row.user_question_progress.questionId,
                    questionText: row.questions.questionText,
                    videoId: row.questions.videoId,
                    videoTitle: row.videos.title,
                    boxLevel: row.user_question_progress.boxLevel,
                    nextReviewDate: row.user_question_progress.nextReviewDate,
                    options: []
                };
            }

            if (row.question_options) {
                progressMap[progressId].options.push({
                    id: row.question_options.id,
                    optionText: row.question_options.optionText,
                    isCorrect: row.question_options.isCorrect,
                    explanation: row.question_options.explanation,
                });
            }
        }

        const questionsForReview: QuestionForReviewDto[] = Object.values(progressMap).map(q => ({
            ...q,
            boxLevel: q.boxLevel ?? 1, // Default to box 1 if somehow null
        }));

        return questionsForReview;
    } catch (error) {
        logger.db.error("Error fetching questions due for review", error, {
            userId,
        });
        return [];
    }
}
