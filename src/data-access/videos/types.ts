export type VideoDto = {
    id: string;
    user_id: string;
    platform: string;
    title: string;
    channel_name: string;
    duration: number;
    category: string;
    url: string;
    description: string;
    created_at: string;
    updated_at: string;
    expiry_date: string;
    video_id: string;
};

export type CreateVideoDto = {
    user_id: string;
    platform?: string;
    title: string;
    channel_name?: string;
    duration?: number;
    category?: string;
    url: string;
    description?: string;
    video_id?: string;
    expiry_date?: string | null;
};
