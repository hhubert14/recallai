"use server";

import { NextRequest } from "next/server";
import { generateVideoQuestions } from "@/data-access/external-apis/generate-video-questions";
import { createQuestion } from "@/data-access/questions/create-question";
import { createQuestionOptions } from "@/data-access/question-options/create-question-options";
import { authenticateRequest } from "@/clean-architecture/use-cases/extension/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";

export async function POST(request: NextRequest) {
    const { authToken, video_id, title, description, transcript } =
        await request.json();

    if (!authToken || !video_id || !title || !description || !transcript) {
        return jsendFail({ error: "Missing required parameters" });
    }

    try {
        const tokenData = await authenticateRequest(authToken);
        if (tokenData.error) {
            return jsendFail({ error: tokenData.error }, tokenData.status || 401);
        }

        // Use the token's user_id as the authenticated user for this request
        const authenticatedUserId = tokenData.userId;

        if (!authenticatedUserId) {
            return jsendFail({ error: "User not authenticated" }, 401);
        }

        const questionData = await generateVideoQuestions(
            title,
            description,
            transcript
        );
        if (!questionData) {
            return jsendError("Failed to generate video questions");
        }

        // Return the questions directly without additional nesting
        logger.video.info("Questions generated successfully", {
            video_id,
            questionCount: questionData.questions.length,
        });

        // Create each question and its options in the database
        for (const question of questionData.questions) {
            const createdQuestion = await createQuestion({
                videoId: video_id,
                questionText: question.question,
                questionType: "multiple_choice",
            });

            if (!createdQuestion) {
                throw new Error("Failed to create question in the database");
            }

            for (let i = 0; i < question.options.length; i++) {
                await createQuestionOptions({
                    questionId: createdQuestion.id,
                    optionText: question.options[i],
                    isCorrect: i === question.correctAnswerIndex, // Assuming the correct answer is marked
                    explanation:
                        i === question.correctAnswerIndex
                            ? question.explanation
                            : undefined,
                });
            }
        }

        return jsendSuccess(questionData);
    } catch (error) {
        logger.video.error("Failed to generate questions", error, { video_id });
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
