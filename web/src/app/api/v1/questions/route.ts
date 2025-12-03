"use server";

import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { jsendSuccess, jsendFail, jsendError } from "@/lib/jsend";
import { repositories, services } from "@/lib/dependency-injection";
import { CreateMultipleChoiceQuestionUseCase } from "@/clean-architecture/use-cases/question/create-multiple-choice-question.use-case";

export async function POST(request: NextRequest) {
    const { videoId, title, description, transcript } =
        await request.json();

    if (!videoId || !title || !description || !transcript) {
        return jsendFail({ error: "Missing required parameters" });
    }

    try {
        // Authenticate using session cookie
        const { user, error: authError } = await getAuthenticatedUser();
        if (authError || !user) {
            return jsendFail({ error: "Unauthorized" }, 401);
        }

        const questionData = await services.questionGenerator().generate(
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
        const createQuestionUseCase = new CreateMultipleChoiceQuestionUseCase(
            repositories.question()
        );

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
