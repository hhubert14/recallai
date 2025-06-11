import { CreateQuestionOptionsDto } from "./types";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function createQuestionOptions(questionOptionsData: CreateQuestionOptionsDto) {
    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("question_options")
            .insert([questionOptionsData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating question options: ${error.message}`);
        }

        if (!data) {
            throw new Error("No data returned from question options creation");
        }

        return data;
    } catch (error) {
        console.error("Error creating question options:", error);
        throw error;
    }
}