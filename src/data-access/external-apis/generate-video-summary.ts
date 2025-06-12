import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Define the schema for structured output
const VideoSummarySchema = z.object({
  summary: z.string().describe("A comprehensive summary of the video content"),
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
    console.log("=== generateVideoSummary called ===");
    console.log("Title:", title?.length ? `${title.substring(0, 100)}...` : "NO TITLE");
    console.log("Description:", description?.length ? `${description.substring(0, 100)}...` : "NO DESCRIPTION");
    console.log("Transcript:", transcript?.length ? `${transcript.substring(0, 100)}...` : "NO TRANSCRIPT");

    if (!title || !description || !transcript) {
        console.log("❌ Missing required parameters");
        console.log("Missing - Title:", !title, "Description:", !description, "Transcript:", !transcript);
        return undefined;
    }

    const transcriptText = transcript;
    console.log("✅ All parameters present, proceeding with LLM call");

    // Initialize ChatOpenAI with structured output
    console.log("🔧 Initializing ChatOpenAI...");
    const llm = new ChatOpenAI({
        model: "gpt-4.1-nano-2025-04-14", // Note: using a more standard model name
        temperature: 0,
    });

    // Create structured output chain
    console.log("🔧 Creating structured output chain...");
    const structuredLlm = llm.withStructuredOutput(VideoSummarySchema);

    try {
        console.log("🚀 Making LLM API call...");
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

        console.log("✅ LLM API call successful");
        console.log("Result type:", typeof result);
        console.log("Result keys:", result ? Object.keys(result) : "NO RESULT");
        console.log("Summary length:", result?.summary?.length || 0);
        
        return result;
    } catch (error) {
        console.error("❌ Error generating video summary:", error);
        console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        
        if (error instanceof Error && error.stack) {
            console.error("Error stack:", error.stack);
        }
        
        return undefined;
    }
}