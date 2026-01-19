import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
    IVideoSummarizerService,
    GeneratedSummaryDto,
} from "@/clean-architecture/domain/services/video-summarizer.interface";

const VideoSummarySchema = z.object({
    summary: z
        .string()
        .describe("A comprehensive summary of the video content"),
});

export class LangChainVideoSummarizerService implements IVideoSummarizerService {
    async generate(
        title: string,
        description: string,
        transcript: string
    ): Promise<GeneratedSummaryDto | undefined> {
        if (!title || !description || !transcript) {
            logger.video.error(
                "Missing required parameters for video summary",
                undefined,
                {
                    missingTitle: !title,
                    missingDescription: !description,
                    missingTranscript: !transcript,
                }
            );
            return undefined;
        }

        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0,
        });

        const structuredLlm = llm.withStructuredOutput(VideoSummarySchema);

        try {
            const result = await structuredLlm.invoke([
                {
                    role: "user",
                    content: `Analyze the following video and provide a structured summary:

Title: ${title}

Description: ${description}

Transcript: ${transcript}

Please provide:
1. A comprehensive summary of the video content

Be thorough but concise in your analysis.`,
                },
            ]);

            return result;
        } catch (error) {
            logger.video.error("Error generating video summary", error, {
                title: title.substring(0, 50),
            });
            return undefined;
        }
    }
}
