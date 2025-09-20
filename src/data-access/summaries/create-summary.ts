import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateSummaryDto } from "./types";
import { logger } from "@/lib/logger";

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
        logger.db.error("Error creating summary", error, {
            video_id: summaryData.video_id,
        });
        throw error;
    }
}
