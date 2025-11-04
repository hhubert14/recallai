// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateQuestionDto } from "./types";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { questions } from "@/drizzle/schema";

export async function createQuestion(questionData: CreateQuestionDto) {
    // const supabase = createServiceRoleClient();

    try {
        // const { data, error } = await supabase
        //     .from("questions")
        //     .insert([questionData])
        //     .select()
        //     .single();
        const [data] = await db
            .insert(questions)
            .values(questionData)
            .returning();

        // if (error) {
        //     throw new Error(`Error creating question: ${error.message}`);
        // }

        // if (!data) {
        //     throw new Error("No data returned from question creation");
        // }

        return data;
    } catch (error) {
        logger.db.error("Error creating question", error, {
            videoId: questionData.videoId,
        });
        throw error;
    }
}
