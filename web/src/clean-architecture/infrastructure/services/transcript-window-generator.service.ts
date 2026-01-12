import "server-only";

import { ITranscriptWindowGeneratorService } from "@/clean-architecture/domain/services/transcript-window-generator.interface";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";
import { ITranscriptWindowRepository } from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";
import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";
import { WindowBuilder } from "@/lib/window-builder";
import { logger } from "@/lib/logger";

export class TranscriptWindowGeneratorService
    implements ITranscriptWindowGeneratorService
{
    constructor(
        private readonly embeddingService: IEmbeddingService,
        private readonly transcriptWindowRepository: ITranscriptWindowRepository
    ) {}

    async generate(
        videoId: number,
        segments: TranscriptSegment[]
    ): Promise<TranscriptWindowEntity[]> {
        const existingWindows =
            await this.transcriptWindowRepository.findWindowsByVideoId(videoId);

        if (existingWindows.length > 0) {
            logger.video.info(
                `Windows already exist for video ${videoId}, skipping generation`
            );
            return existingWindows;
        }

        if (segments.length === 0) {
            logger.video.warn(`No transcript segments for video ${videoId}`);
            return [];
        }

        const windowBuilder = new WindowBuilder();
        const windows = windowBuilder.buildWindows(segments);

        if (windows.length === 0) {
            logger.video.warn(`No windows built for video ${videoId}`);
            return [];
        }

        logger.video.info(
            `Generating embeddings for ${windows.length} windows for video ${videoId}`
        );

        const windowTexts = windows.map((w) => w.text);
        const embeddings = await this.embeddingService.embedBatch(windowTexts);

        const windowsToCreate = windows.map((window, index) => ({
            videoId,
            windowIndex: window.windowIndex,
            startTime: window.startTime,
            endTime: window.endTime,
            text: window.text,
            embedding: embeddings[index],
        }));

        const createdWindows =
            await this.transcriptWindowRepository.createWindowsBatch(
                windowsToCreate
            );

        logger.video.info(
            `Created ${createdWindows.length} transcript windows for video ${videoId}`
        );

        return createdWindows;
    }
}
