import { summaries } from "@/drizzle/schema";
// export type CreateSummaryDto = {
//     videoId: number;
//     content: string;
// };

// export type SummaryDto = {
//     id: number;
//     video_id: number;
//     content: string;
//     created_at: string;
//     updated_at: string;
// };

export type CreateSummaryDto = typeof summaries.$inferInsert
export type SummaryDto = typeof summaries.$inferSelect