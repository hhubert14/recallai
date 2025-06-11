import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateQuestionDto } from "./types";

export async function createQuestion(questionData: CreateQuestionDto) {
    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("questions")
            .insert([questionData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating question: ${error.message}`);
        }

        if (!data) {
            throw new Error("No data returned from question creation");
        }

        return data;
    } catch (error) {
        console.error("Error creating question:", error);
        throw error;
    }
}