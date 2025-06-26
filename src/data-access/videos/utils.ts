import { VideoDto } from "./types";

export function toDtoMapper(video: any): VideoDto {
    return {
        id: video.id,
        user_id: video.user_id,
        platform: video.platform,
        title: video.title,
        channel_name: video.channel_name,
        duration: video.duration,
        category: video.category,
        url: video.url,
        description: video.description,
        created_at: video.created_at,
        updated_at: video.updated_at,
        expiry_date: video.expiry_date,
        video_id: video.video_id,
        deleted_at: video.deleted_at,
        should_expire: video.should_expire,
    };
}
