import { CreateQuestionOptionsDto } from "./types";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { questionOptions } from "@/drizzle/schema";

export async function createQuestionOptions(
    questionOptionsData: CreateQuestionOptionsDto
) {
    // const supabase = createServiceRoleClient();

    try {
        // const { data, error } = await supabase
        //     .from("question_options")
        //     .insert([questionOptionsData])
        //     .select()
        //     .single();

        const [data] = await db
            .insert(questionOptions)
            .values(questionOptionsData)
            .returning();

        // if (error) {
        //     throw new Error(
        //         `Error creating question options: ${error.message}`
        //     );
        // }

        // if (!data) {
        //     throw new Error("No data returned from question options creation");
        // }

        return data;
    } catch (error) {
        logger.db.error("Error creating question options", error, {
            questionId: questionOptionsData.questionId,
        });
        throw error;
    }
}
