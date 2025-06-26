import "server-only";

import OpenAI from "openai";
// import { YoutubeTranscript } from "./types";
import { extractTranscriptText } from "./utils";
import { logger } from "@/lib/logger";

export async function checkVideoEducational(
    title: string,
    description: string,
    // transcript: YoutubeTranscript
    transcript: string
): Promise<boolean | undefined> {
    logger.video.debug("Checking if video is educational", {
        title,
        hasDescription: !!description,
        transcriptLength: transcript?.length || 0
    });
    
    // Title and transcript are required, but description can be empty
    if (!title || !transcript) {
        return undefined;
    }

    // const transcriptText = extractTranscriptText(transcript);
    const transcriptText = transcript;

    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            {
                role: "system",
                content: `You are an expert at classifying video content. Educational videos teach specific skills, explain concepts, provide tutorials, or present factual information with the primary purpose of learning. Entertainment videos are primarily for fun, gaming, reactions, vlogs, or casual content even if they mention some facts.

Examples of educational content:
- Tutorial videos (how to code, cook, etc.)
- Academic lectures or lessons
- Documentary-style content explaining topics
- Skill-building or professional development
- Science explanations and demonstrations

Examples of non-educational content:
- Gaming videos (playing games, reactions)
- Entertainment/comedy content
- Vlogs and personal stories
- Reaction videos
- Casual conversations about topics`
            },
            {
                role: "user",
                content: `Classify this video as educational or not educational based on its primary purpose.

Title: ${title}
Description: ${description || 'No description provided'}
Transcript excerpt: ${transcriptText.substring(0, 2000)}...

Respond with exactly "EDUCATIONAL" or "NOT_EDUCATIONAL" and nothing else.`,
            },
        ],
        temperature: 0,
    });

    const answer = response.choices[0].message.content?.trim();

    logger.video.debug("OpenAI educational classification response", { 
        answer,
        isEducational: answer === "EDUCATIONAL"
    });

    if (!answer || typeof answer !== "string") {
        return undefined;
    }

    return answer === "EDUCATIONAL";
}
