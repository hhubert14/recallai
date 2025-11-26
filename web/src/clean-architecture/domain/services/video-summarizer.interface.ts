export type GeneratedSummaryDto = {
    summary: string;
};

export interface IVideoSummarizerService {
    generate(
        title: string,
        description: string,
        transcript: string
    ): Promise<GeneratedSummaryDto | undefined>;
}
