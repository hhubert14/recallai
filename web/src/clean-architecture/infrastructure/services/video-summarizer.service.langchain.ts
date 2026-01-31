import "server-only";

import { z } from "zod";
import { logger } from "@/lib/logger";
import {
    IVideoSummarizerService,
    GeneratedSummaryDto,
    TranscriptWithTimestamps,
} from "@/clean-architecture/domain/services/video-summarizer.interface";
import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";
import { formatTimestamp } from "@/lib/format-timestamp";
import { createLangChainGateway, SUMMARIZER_PRIORITY } from "@/lib/llm";

const VideoSummarySchema = z.object({
    summary: z
        .string()
        .describe(
            "A comprehensive summary of the video content in markdown format with section headings, bullet points, and timestamp references"
        ),
});

function formatTranscriptWithTimestamps(segments: TranscriptSegment[]): string {
    return segments
        .map((s) => `[${formatTimestamp(s.startTime)}] ${s.text}`)
        .join("\n");
}

export class LangChainVideoSummarizerService implements IVideoSummarizerService {
    async generate(
        title: string,
        description: string,
        transcript: TranscriptWithTimestamps
    ): Promise<GeneratedSummaryDto | undefined> {
        if (!title || !description || !transcript.fullText) {
            logger.video.error(
                "Missing required parameters for video summary",
                undefined,
                {
                    missingTitle: !title,
                    missingDescription: !description,
                    missingTranscript: !transcript.fullText,
                }
            );
            return undefined;
        }

        const formattedTranscript = formatTranscriptWithTimestamps(
            transcript.segments
        );

        const prompt = `Analyze the following video and provide a structured summary in markdown format.

Title: ${title}

Description: ${description}

Transcript with timestamps:
${formattedTranscript}

Please provide a comprehensive summary following these guidelines:

## Formatting Requirements:
- Use markdown section headings (## for main sections)
- Use bullet points for lists of key points
- Reference specific timestamps in parentheses, e.g., (1:15) or (1:02:30)
- Keep paragraphs concise and scannable

## Required Sections:
1. **Overview** - A brief 2-3 sentence overview of what the video covers
2. **Key Concepts** - Main ideas and concepts discussed (with timestamps)
3. **Important Details** - Specific facts, examples, or demonstrations worth noting (with timestamps)
4. **Takeaways** - Key lessons or actionable insights from the video

Be thorough but concise. Focus on the most valuable information for someone who wants to learn from this video.`;

        try {
            const gateway = createLangChainGateway();
            const result = await gateway.invokeWithStructuredOutput(
                SUMMARIZER_PRIORITY,
                VideoSummarySchema,
                [{ role: "user", content: prompt }]
            );

            return result;
        } catch (error) {
            logger.video.error("Error generating video summary", error, {
                title: title.substring(0, 50),
            });
            return undefined;
        }
    }
}
