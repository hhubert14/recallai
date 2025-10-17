import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logger } from "@/lib/logger";

export async function getUserVideoExpiryStats(userId: string) {
    const supabase = createServiceRoleClient();

    try {
        const now = new Date();
        const threeDaysFromNow = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
        );
        // const sevenDaysFromNow = new Date(
        //     now.getTime() + 7 * 24 * 60 * 60 * 1000
        // );

        const [
            { count: expiringVideos },
            { count: expiringSoon },
            { count: permanentVideos },
            { data: nextExpiring },
        ] = await Promise.all([
            // Videos that will expire (should_expire = true)
            supabase
                .from("videos")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("should_expire", true)
                .gte("expiry_date", now.toISOString())
                .is("deleted_at", null),

            // Videos expiring soon (within 3 days)
            supabase
                .from("videos")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("should_expire", true)
                .gte("expiry_date", now.toISOString())
                .lte("expiry_date", threeDaysFromNow.toISOString())
                .is("deleted_at", null),

            // Permanent videos (should_expire = false)
            supabase
                .from("videos")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("should_expire", false)
                .is("deleted_at", null),

            // Next expiring video
            supabase
                .from("videos")
                .select("title, expiry_date")
                .eq("user_id", userId)
                .eq("should_expire", true)
                .gte("expiry_date", now.toISOString())
                .is("deleted_at", null)
                .order("expiry_date", { ascending: true })
                .limit(1),
        ]);

        return {
            expiringVideos: expiringVideos || 0,
            expiringSoon: expiringSoon || 0,
            permanentVideos: permanentVideos || 0,
            nextExpiring:
                nextExpiring && nextExpiring.length > 0
                    ? nextExpiring[0]
                    : null,
        };
    } catch (error) {
        logger.db.error("Error getting user video expiry stats", error, {
            userId,
        });
        return {
            expiringVideos: 0,
            expiringSoon: 0,
            permanentVideos: 0,
            nextExpiring: null,
        };
    }
}
