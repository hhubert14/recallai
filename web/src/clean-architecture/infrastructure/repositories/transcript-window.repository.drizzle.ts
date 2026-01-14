import {
	ITranscriptWindowRepository,
	WindowMatchResult,
} from "@/clean-architecture/domain/repositories/transcript-window.repository.interface";
import { TranscriptWindowEntity } from "@/clean-architecture/domain/entities/transcript-window.entity";
import { db } from "@/drizzle";
import { transcriptWindows } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { cosineDistance } from "drizzle-orm";

export class DrizzleTranscriptWindowRepository
	implements ITranscriptWindowRepository
{
	async createWindowsBatch(
		windows: {
			videoId: number;
			windowIndex: number;
			startTime: number;
			endTime: number;
			text: string;
			embedding: number[];
		}[]
	): Promise<TranscriptWindowEntity[]> {
		if (windows.length === 0) {
			return [];
		}

		const data = await db
			.insert(transcriptWindows)
			.values(windows)
			.returning();

		return data.map((window) => this.toEntity(window));
	}

	async findWindowsByVideoId(videoId: number): Promise<TranscriptWindowEntity[]> {
		const data = await db
			.select()
			.from(transcriptWindows)
			.where(eq(transcriptWindows.videoId, videoId));

		return data.map((window) => this.toEntity(window));
	}

	async findMostSimilarWindow(
		videoId: number,
		queryEmbedding: number[]
	): Promise<WindowMatchResult | null> {
		const results = await this.findTopKSimilarWindows(videoId, queryEmbedding, 1);
		return results.length > 0 ? results[0] : null;
	}

	async findTopKSimilarWindows(
		videoId: number,
		queryEmbedding: number[],
		k: number
	): Promise<WindowMatchResult[]> {
		const similarity = sql<number>`1 - (${cosineDistance(transcriptWindows.embedding, queryEmbedding)})`;

		const results = await db
			.select({
				id: transcriptWindows.id,
				videoId: transcriptWindows.videoId,
				windowIndex: transcriptWindows.windowIndex,
				startTime: transcriptWindows.startTime,
				endTime: transcriptWindows.endTime,
				text: transcriptWindows.text,
				embedding: transcriptWindows.embedding,
				createdAt: transcriptWindows.createdAt,
				similarity,
			})
			.from(transcriptWindows)
			.where(eq(transcriptWindows.videoId, videoId))
			.orderBy(desc(similarity))
			.limit(k);

		return results.map((result) => ({
			window: this.toEntity(result),
			similarity: result.similarity,
		}));
	}

	async deleteWindowsByVideoId(videoId: number): Promise<void> {
		await db
			.delete(transcriptWindows)
			.where(eq(transcriptWindows.videoId, videoId));
	}

	private toEntity(
		data: typeof transcriptWindows.$inferSelect
	): TranscriptWindowEntity {
		return new TranscriptWindowEntity(
			data.id,
			data.videoId,
			data.windowIndex,
			data.startTime,
			data.endTime,
			data.text,
			data.embedding,
			data.createdAt,
		);
	}
}
