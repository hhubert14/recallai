import "server-only";

import OpenAI from "openai";
import { YoutubeTranscript } from "./types";
import { extractTranscriptText } from "./utils";

export async function checkVideoEducational(
    title: string,
    description: string,
    transcript: YoutubeTranscript
): Promise<boolean | undefined> {
    if (!title || !description || !transcript) {
        return undefined;
    }

    const transcriptText = extractTranscriptText(transcript);

    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            {
                role: "user",
                content: `Is the following video educational?\n\nTitle: ${title}\nDescription: ${description}\nTranscript: ${transcriptText}\n\nPlease answer with "yes" or "no". If you are unsure, respond with "no".`,
            },
        ],
    });

    const answer = response.choices[0].message.content;

    if (!answer || typeof answer !== "string") {
        return undefined;
    }

    return answer.toLowerCase().includes("yes");
}
