import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Define the schema for structured output
const VideoSummarySchema = z.object({
    summary: z
        .string()
        .describe("A comprehensive summary of the video content"),
    //   keyPoints: z.array(z.string()).describe("Main key points or takeaways from the video"),
    //   topics: z.array(z.string()).describe("Primary topics covered in the video"),
    //   isWorthWatching: z.boolean().describe("Whether the video is worth watching based on content quality"),
    //   duration: z.string().optional().describe("Estimated watch time or content density"),
    //   targetAudience: z.string().describe("Who would benefit most from watching this video")
});

type VideoSummary = z.infer<typeof VideoSummarySchema>;

export async function generateVideoSummary(
    title: string,
    description: string,
    transcript: string
): Promise<VideoSummary | undefined> {
    if (!title || !description || !transcript) {
        logger.video.error("Missing required parameters for video summary", undefined, {
            missingTitle: !title,
            missingDescription: !description,
            missingTranscript: !transcript
        });
        return undefined;
    }

    const transcriptText = transcript;

    // Initialize ChatOpenAI with structured output
    const llm = new ChatOpenAI({
        model: "gpt-4.1-nano-2025-04-14", // Note: using a more standard model name
        temperature: 0,
    });

    // Create structured output chain
    const structuredLlm = llm.withStructuredOutput(VideoSummarySchema);

    try {
        const result = await structuredLlm.invoke([
            {
                role: "user",
                content: `Analyze the following video and provide a structured summary:

Title: ${title}

Description: ${description}

Transcript: ${transcriptText}

Please provide:
1. A comprehensive summary of the video content

Be thorough but concise in your analysis.`,
            },
        ]);

        return result;
    } catch (error) {
        logger.video.error("Error generating video summary", error, { title: title.substring(0, 50) });
        return undefined;
    }
}
