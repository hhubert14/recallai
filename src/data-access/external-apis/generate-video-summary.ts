import "server-only";

import OpenAI from "openai";

export async function generateVideoSummary(
    title: string,
    description: string,
    transcript: string
): Promise<boolean | undefined> {
    if (!title || !description || !transcript) {
        return undefined;
    }

    // const transcriptText = extractTranscriptText(transcript);
    const transcriptText = transcript;

    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            {
                role: "user",
                content: `Generate a summary for the video with the following details:\n\nTitle: ${title}\nDescription: ${description}\nTranscript: ${transcriptText}`,
            },
        ],
    });

    const answer = response.choices[0].message.content;

    if (!answer || typeof answer !== "string") {
        return undefined;
    }

    return answer.toLowerCase().includes("yes");
}
