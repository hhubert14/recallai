"use server";

import { createUserAnswer } from "@/data-access/user-answers/create-user-answer";
import { CreateUserAnswerDto } from "@/data-access/user-answers/types";

export async function submitAnswer(userAnswer: CreateUserAnswerDto): Promise<boolean> {
    try {
        return await createUserAnswer(userAnswer);
    } catch (error) {
        console.error("Error submitting answer:", error);
        return false;
    }
}
