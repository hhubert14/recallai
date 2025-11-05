// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateUserQuestionProgressDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { userQuestionProgress } from "@/drizzle/schema";

export async function createUserQuestionProgress(
    progressData: CreateUserQuestionProgressDto
): Promise<boolean> {
    // const supabase = await createServiceRoleClient();

    try {
        // const { error } = await supabase
        //     .from("user_question_progress")
        //     .insert([progressData]);

        await db
            .insert(userQuestionProgress)
            .values(progressData);

        // if (error) {
        //     logger.db.error("Database insert error", error, { progressData });
        //     throw error;
        // }

        return true;
    } catch (error) {
        logger.db.error("Error creating user question progress", error, {
            progressData,
        });
        return false;
    }
}
