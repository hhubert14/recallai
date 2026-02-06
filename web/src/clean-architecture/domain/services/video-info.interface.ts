export type VideoInfoDto = {
  title: string;
  description: string;
  channelName: string;
};

export interface IVideoInfoService {
  get(videoId: string): Promise<VideoInfoDto | undefined>;
}
