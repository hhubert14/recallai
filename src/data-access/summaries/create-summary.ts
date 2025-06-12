import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateSummaryDto } from "./types";

export async function createSummary(summaryData: CreateSummaryDto) {
    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("summaries")
            .insert([summaryData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating summary: ${error.message}`);
        }

        if (!data) {
            throw new Error("No data returned from summary creation");
        }

        return data;
    } catch (error) {
        console.error("Error creating summary:", error);
        throw error;
    }
}