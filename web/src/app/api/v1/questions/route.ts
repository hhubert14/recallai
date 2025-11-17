"use server";

import { NextRequest } from "next/server";
import { generateVideoQuestions } from "@/data-access/external-apis/generate-video-questions";
import { authenticateRequest } from "@/clean-architecture/use-cases/authentication/authenticate-request";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { createQuestionRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { CreateMultipleChoiceQuestionUseCase } from "@/clean-architecture/use-cases/question/create-multiple-choice-question.use-case";

export async function POST(request: NextRequest) {
    const { authToken, videoId, title, description, transcript } =
        await request.json();

    if (!authToken || !videoId || !title || !description || !transcript) {
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

        logger.video.info("Questions generated successfully", {
            videoId,
            questionCount: questionData.questions.length,
        });

        // Create each question and its options in the database
        const questionRepo = createQuestionRepository();
        const createQuestionUseCase = new CreateMultipleChoiceQuestionUseCase(questionRepo);

        for (const question of questionData.questions) {
            const options = question.options.map((optionText, i) => ({
                optionText,
                isCorrect: i === question.correctAnswerIndex,
                orderIndex: i,
                explanation: i === question.correctAnswerIndex ? question.explanation : null,
            }));

            await createQuestionUseCase.execute(
                videoId,
                question.question,
                options
            );
        }

        return jsendSuccess(questionData);
    } catch (error) {
        logger.video.error("Failed to generate questions", error, { videoId });
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return jsendError(errorMessage);
    }
}
