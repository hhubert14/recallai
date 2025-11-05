import { videos } from "@/drizzle/schema";

export type VideoDto = typeof videos.$inferSelect

// export type VideoDto = {
//     id: number;
//     user_id: string;
//     platform: string;
//     title: string;
//     channel_name: string;
//     duration: number;
//     category: string;
//     url: string;
//     description: string;
//     created_at: string;
//     updated_at: string;
//     expiry_date: string;
//     video_id: string;
//     deleted_at: string | null;
//     should_expire: boolean;
// };

// export type CreateVideoDto = {
//     userId: string;
//     platform?: string;
//     title: string;
//     channelName?: string;
//     duration?: number;
//     category?: string;
//     url: string;
//     description?: string;
//     videoId?: string;
//     expiryDate?: string | null;
//     deletedAt?: string | null;
//     shouldExpire?: boolean;
// };
export type CreateVideoDto = typeof videos.$inferInsert
