import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function getTotalVideosByUserId(userId: string): Promise<number> {
    if (!userId) {
        return 0;
    }

    const supabase = await createServiceRoleClient();

    try {        const { count, error } = await supabase
            .from("videos")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .is("deleted_at", null);        if (error) {
            logger.db.error("Database query error", error, { userId });
            throw error;
        }

        return count || 0;
    } catch (error) {
        logger.db.error("Error fetching total videos by user ID", error, { userId });
        return 0;
    }
}
