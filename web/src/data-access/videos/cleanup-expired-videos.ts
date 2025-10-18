// import "server-only";

// import { createServiceRoleClient } from "@/lib/supabase/service-role";

// /**
//  * Deletes videos that have expired and are marked to expire
//  * This function can be called by Supabase functions or other scheduling mechanisms
//  */
// export async function cleanupExpiredVideos() {
//     const supabase = createServiceRoleClient();

//     try {
//         console.log("Starting cleanup of expired videos...");

//         // Find videos that should expire and have passed their expiry date
//         const { data: expiredVideos, error: selectError } = await supabase
//             .from("videos")
//             .select("id, user_id, title, expiry_date")
//             .eq("should_expire", true)
//             .lt("expiry_date", new Date().toISOString())
//             .is("deleted_at", null);

//         if (selectError) {
//             throw new Error(`Error selecting expired videos: ${selectError.message}`);
//         }

//         if (!expiredVideos || expiredVideos.length === 0) {
//             console.log("No expired videos found to cleanup");
//             return {
//                 deletedCount: 0,
//                 deletedVideos: []
//             };
//         }

//         console.log(`Found ${expiredVideos.length} expired videos to delete`);

//         // Hard delete the expired videos
//         const videoIds = expiredVideos.map(video => video.id);

//         const { data: deletedVideos, error: deleteError } = await supabase
//             .from("videos")
//             .delete()
//             .in("id", videoIds)
//             .select();

//         if (deleteError) {
//             throw new Error(`Error deleting expired videos: ${deleteError.message}`);
//         }

//         console.log(`Successfully deleted ${deletedVideos?.length || 0} expired videos`);

//         // Log the cleanup for monitoring
//         const deletedVideoDetails = expiredVideos.map(video => ({
//             id: video.id,
//             user_id: video.user_id,
//             title: video.title,
//             expiry_date: video.expiry_date
//         }));

//         return {
//             deletedCount: deletedVideos?.length || 0,
//             deletedVideos: deletedVideoDetails
//         };

//     } catch (error) {
//         console.error("Error during video cleanup:", error);
//         throw error;
//     }
// }

// /**
//  * Get statistics about videos that will expire soon (within next 3 days)
//  * Useful for sending notifications to users
//  */
// export async function getVideosExpiringSoon(daysAhead: number = 3) {
//     const supabase = createServiceRoleClient();

//     try {
//         const futureDate = new Date();
//         futureDate.setDate(futureDate.getDate() + daysAhead);

//         const { data, error } = await supabase
//             .from("videos")
//             .select("id, user_id, title, expiry_date")
//             .eq("should_expire", true)
//             .gte("expiry_date", new Date().toISOString())
//             .lte("expiry_date", futureDate.toISOString())
//             .is("deleted_at", null);

//         if (error) {
//             throw new Error(`Error getting videos expiring soon: ${error.message}`);
//         }

//         return data || [];
//     } catch (error) {
//         console.error("Error getting videos expiring soon:", error);
//         throw error;
//     }
// }

// /**
//  * Get detailed information about users with expiring videos for notifications
//  * Returns user data along with their expiring videos
//  */
// export async function getUsersWithExpiringVideos(daysAhead: number = 3) {
//     const supabase = createServiceRoleClient();

//     try {
//         const futureDate = new Date();
//         futureDate.setDate(futureDate.getDate() + daysAhead);

//         // Get videos expiring soon with user information
//         const { data, error } = await supabase
//             .from("videos")
//             .select(`
//                 id,
//                 title,
//                 expiry_date,
//                 users!inner(
//                     id,
//                     email,
//                     is_subscribed
//                 )
//             `)
//             .eq("should_expire", true)
//             .gte("expiry_date", new Date().toISOString())
//             .lte("expiry_date", futureDate.toISOString())
//             .is("deleted_at", null);

//         if (error) {
//             throw new Error(`Error getting users with expiring videos: ${error.message}`);
//         }

//         // Group videos by user
//         const userVideoMap = new Map();

//         data?.forEach(video => {
//             const userId = video.users.id;
//             if (!userVideoMap.has(userId)) {
//                 userVideoMap.set(userId, {
//                     user: video.users,
//                     videos: []
//                 });
//             }
//             userVideoMap.get(userId).videos.push({
//                 id: video.id,
//                 title: video.title,
//                 expiry_date: video.expiry_date
//             });
//         });

//         return Array.from(userVideoMap.values());
//     } catch (error) {
//         console.error("Error getting users with expiring videos:", error);
//         throw error;
//     }
// }

// /**
//  * Get statistics about video expiry for monitoring
//  */
// export async function getVideoExpiryStats() {
//     const supabase = createServiceRoleClient();

//     try {
//         const now = new Date();
//         const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//         const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

//         const [
//             { count: expiringToday },
//             { count: expiringTomorrow },
//             { count: expiringThisWeek },
//             { count: totalExpiringVideos },
//             { count: totalPermanentVideos }
//         ] = await Promise.all([
//             // Expiring today
//             supabase
//                 .from("videos")
//                 .select("*", { count: 'exact', head: true })
//                 .eq("should_expire", true)
//                 .gte("expiry_date", now.toISOString())
//                 .lt("expiry_date", tomorrow.toISOString())
//                 .is("deleted_at", null),

//             // Expiring tomorrow
//             supabase
//                 .from("videos")
//                 .select("*", { count: 'exact', head: true })
//                 .eq("should_expire", true)
//                 .gte("expiry_date", tomorrow.toISOString())
//                 .lt("expiry_date", new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString())
//                 .is("deleted_at", null),

//             // Expiring this week
//             supabase
//                 .from("videos")
//                 .select("*", { count: 'exact', head: true })
//                 .eq("should_expire", true)
//                 .gte("expiry_date", now.toISOString())
//                 .lte("expiry_date", nextWeek.toISOString())
//                 .is("deleted_at", null),

//             // Total expiring videos
//             supabase
//                 .from("videos")
//                 .select("*", { count: 'exact', head: true })
//                 .eq("should_expire", true)
//                 .is("deleted_at", null),

//             // Total permanent videos
//             supabase
//                 .from("videos")
//                 .select("*", { count: 'exact', head: true })
//                 .eq("should_expire", false)
//                 .is("deleted_at", null)
//         ]);

//         return {
//             expiringToday: expiringToday || 0,
//             expiringTomorrow: expiringTomorrow || 0,
//             expiringThisWeek: expiringThisWeek || 0,
//             totalExpiringVideos: totalExpiringVideos || 0,
//             totalPermanentVideos: totalPermanentVideos || 0
//         };
//     } catch (error) {
//         console.error("Error getting video expiry stats:", error);
//         throw error;
//     }
// }
