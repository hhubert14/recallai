import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function getVideosThisMonthByUserId(
    userId: string
): Promise<number> {
    const supabase = await createServiceRoleClient();
    // Get the start of current month in UTC
    const now = new Date();
    const startOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    try {
        // For billing purposes, count only videos processed under free plan (should_expire = true)
        // This excludes videos processed when user had premium subscription
        // Also include soft-deleted videos to prevent users from deleting data to reset limits
        const { count, error } = await supabase
            .from("videos")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("should_expire", true)
            .gte("created_at", startOfMonth.toISOString());

        if (error) {
            logger.db.error("Error fetching monthly video count", error, {
                userId,
            });
            return 0;
        }

        return count || 0;
    } catch (error) {
        logger.db.error("Error fetching monthly video count", error, {
            userId,
        });
        return 0;
    }
}
