import { SummaryEntity } from "../entities/summary.entity";

export interface ISummaryRepository {
    createSummary(videoId: number, content: string): Promise<SummaryEntity>;
    findSummaryByVideoId(videoId: number): Promise<SummaryEntity | null>;
}