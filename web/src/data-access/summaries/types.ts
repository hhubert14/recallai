export type CreateSummaryDto = {
    videoId: number;
    content: string;
};

export type SummaryDto = {
    id: number;
    video_id: number;
    content: string;
    created_at: string;
    updated_at: string;
};
