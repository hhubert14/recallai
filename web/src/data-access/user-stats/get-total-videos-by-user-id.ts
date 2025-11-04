// import "server-only";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { videos } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";

export async function getTotalVideosByUserId(userId: string): Promise<number> {
    if (!userId) {
        return 0;
    }

    // const supabase = await createServiceRoleClient();

    try {
        // const { count, error } = await supabase
        //     .from("videos")
        //     .select("*", { count: "exact", head: true })
        //     .eq("user_id", userId)
        //     .is("deleted_at", null);

        const result = await db
            .select({ count: count() })
            .from(videos)
            .where(eq(videos.userId, userId));

        // if (error) {
        //     logger.db.error("Database query error", error, { userId });
        //     throw error;
        // }

        return result[0]?.count || 0;
    } catch (error) {
        logger.db.error("Error fetching total videos by user ID", error, {
            userId,
        });
        return 0;
    }
}
