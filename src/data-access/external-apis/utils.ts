import { YoutubeTranscript } from "./types";

export function extractTranscriptText(transcript: YoutubeTranscript): string {
    if (!transcript || !transcript.transcript) {
        return "";
    }

    return transcript.transcript.map(item => item.text).join(" ");
}
export function extractTranscriptTimestamps(transcript: YoutubeTranscript): string[] {
    if (!transcript || !transcript.transcript) {
        return [];
    }

    return transcript.transcript.map(item => item.start);
}