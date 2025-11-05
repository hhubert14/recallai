// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionForReviewDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userAnswers, questions, videos, questionOptions, userQuestionProgress } from "@/drizzle/schema";
import { eq, desc, and, notInArray } from "drizzle-orm";

export async function getQuestionsForInitialReview(
    userId: string,
    limit: number = 10
): Promise<QuestionForReviewDto[]> {
    if (!userId) {
        return [];
    }

    // const supabase = await createServiceRoleClient();

    try {
        // First get question IDs that are already in spaced repetition
        const existingProgressList = await db
            .select({ questionId: userQuestionProgress.questionId })
            .from(userQuestionProgress)
            .where(eq(userQuestionProgress.userId, userId));

        const existingQuestionIds = existingProgressList.map(p => p.questionId);

        // Get questions that have been answered by this user but not in spaced repetition
        // First get distinct question IDs from user answers (not in spaced repetition)
        // Include createdAt in select so we can order by it
        const answeredRows = await db
            .selectDistinct({
                questionId: userAnswers.questionId,
                createdAt: userAnswers.createdAt
            })
            .from(userAnswers)
            .where(
                existingQuestionIds.length > 0
                    ? and(
                        eq(userAnswers.userId, userId),
                        notInArray(userAnswers.questionId, existingQuestionIds)
                    )
                    : eq(userAnswers.userId, userId)
            )
            .orderBy(desc(userAnswers.createdAt))
            .limit(50);

        if (answeredRows.length === 0) {
            return [];
        }

        const questionIds = answeredRows.map(row => row.questionId);

        // Now get full question data with joins
        const rows = await db
            .select()
            .from(questions)
            .innerJoin(videos, eq(questions.videoId, videos.id))
            .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
            .where(eq(videos.userId, userId));

        // Filter to only questions we want and group options
        type QuestionData = {
            id: number;
            questionText: string;
            videoId: number;
            videoTitle: string;
            options: Array<{
                id: number;
                optionText: string;
                isCorrect: boolean;
                explanation: string | null;
            }>;
        };
        const questionsMap: Record<number, QuestionData> = {};

        for (const row of rows) {
            if (!questionIds.includes(row.questions.id)) continue;

            if (!questionsMap[row.questions.id]) {
                questionsMap[row.questions.id] = {
                    id: row.questions.id,
                    questionText: row.questions.questionText,
                    videoId: row.questions.videoId,
                    videoTitle: row.videos.title,
                    options: []
                };
            }

            if (row.question_options) {
                questionsMap[row.questions.id].options.push({
                    id: row.question_options.id,
                    optionText: row.question_options.optionText,
                    isCorrect: row.question_options.isCorrect,
                    explanation: row.question_options.explanation,
                });
            }
        }

        // Transform to DTO structure and apply limit
        const initialReviewQuestions: QuestionForReviewDto[] = Object.values(questionsMap)
            .slice(0, limit)
            .map((question) => ({
                id: 0, // No progress record yet
                questionId: question.id,
                questionText: question.questionText,
                videoId: question.videoId,
                videoTitle: question.videoTitle,
                boxLevel: 1, // Will start at box 1
                nextReviewDate: null, // Will be set after first review
                options: question.options,
            }));

        return initialReviewQuestions;
    } catch (error) {
        logger.db.error("Error fetching questions for initial review", error, {
            userId,
        });
        return [];
    }
}
