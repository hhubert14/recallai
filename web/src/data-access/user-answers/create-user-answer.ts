// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateUserAnswerDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userAnswers } from "@/drizzle/schema";

export async function createUserAnswer(
    userAnswer: CreateUserAnswerDto
): Promise<boolean> {
    // const supabase = await createServiceRoleClient();

    try {
        // const { error } = await supabase
        //     .from("user_answers")
        //     .insert([userAnswer]);

        await db
            .insert(userAnswers)
            .values(userAnswer);

        // if (error) {
        //     logger.db.error("Database insert error", error, { userAnswer });
        //     throw error;
        // }

        return true;
    } catch (error) {
        logger.db.error("Error creating user answer", error, { userAnswer });
        return false;
    }
}
