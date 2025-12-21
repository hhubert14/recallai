import "server-only";

import { logger } from "@/lib/logger";
import { IEmbeddingService } from "@/clean-architecture/domain/services/embedding.interface";

interface SupabaseEmbedResponse {
	embedding: number[];
}

export class SupabaseEmbeddingService implements IEmbeddingService {
	async embed(text: string): Promise<number[]> {
		try {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

			if (!supabaseUrl || !supabaseAnonKey) {
				throw new Error(
					"NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
				);
			}

			if (text.length > 2000) {
				logger.video.warn("Text may exceed 512 token limit for gte-small", {
					textLength: text.length,
				});
			}

			const response = await fetch(`${supabaseUrl}/functions/v1/embed`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${supabaseAnonKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ input: text }),
			});

			if (!response.ok) {
				throw new Error(
					`Embedding API returned ${response.status}: ${response.statusText}`
				);
			}

			const data: SupabaseEmbedResponse = await response.json();

			if (data.embedding.length !== 384) {
				throw new Error(
					`Invalid embedding dimensions: expected 384, got ${data.embedding.length}`
				);
			}

			return data.embedding;
		} catch (error) {
			logger.video.error("Error generating embedding", error, {
				textLength: text.length,
			});
			throw error;
		}
	}

	async embedBatch(texts: string[]): Promise<number[][]> {
		const CONCURRENCY_LIMIT = 10;
		const results: number[][] = [];

		for (let i = 0; i < texts.length; i += CONCURRENCY_LIMIT) {
			const batch = texts.slice(i, i + CONCURRENCY_LIMIT);
			const batchResults = await Promise.all(
				batch.map((text) => this.embed(text))
			);
			results.push(...batchResults);
		}

		return results;
	}
}
