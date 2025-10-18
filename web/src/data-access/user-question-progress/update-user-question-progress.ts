import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { UpdateUserQuestionProgressDto } from "./types";
import { logger } from "@/lib/logger";

export async function updateUserQuestionProgress(
    userId: string,
    questionId: number,
    updateData: UpdateUserQuestionProgressDto
): Promise<boolean> {
    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .from("user_question_progress")
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("question_id", questionId);

        if (error) {
            logger.db.error("Database update error", error, {
                userId,
                questionId,
                updateData,
            });
            throw error;
        }

        return true;
    } catch (error) {
        logger.db.error("Error updating user question progress", error, {
            userId,
            questionId,
            updateData,
        });
        return false;
    }
}
