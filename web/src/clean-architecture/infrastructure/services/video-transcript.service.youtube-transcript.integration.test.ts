import { describe, it, expect, beforeAll } from "vitest";

/**
 * Integration tests for YoutubeTranscriptVideoTranscriptService
 *
 * These tests hit the real API and verify the integration works.
 * Skipped by default - run explicitly with:
 *   npm run test -- --testNamePattern="integration" --no-file-parallelism
 *
 * Requires YOUTUBE_TRANSCRIPT_API_KEY in .env or environment
 */

const API_KEY = process.env.YOUTUBE_TRANSCRIPT_API_KEY;

// Skip all tests if no API key is set
const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration("YoutubeTranscriptVideoTranscriptService (integration)", () => {
    beforeAll(() => {
        if (!API_KEY) {
            throw new Error("YOUTUBE_TRANSCRIPT_API_KEY is required for integration tests");
        }
    });

    it("fetches transcript for a known video", async () => {
        const videoId = "uJbbtrx5M_E";

        const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
            method: "POST",
            headers: {
                Authorization: `Basic ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: [videoId] }),
        });

        expect(response.ok).toBe(true);

        const data = await response.json();

        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBeGreaterThan(0);

        const videoData = data[0];

        // Verify required fields exist
        expect(videoData).toHaveProperty("text");
        expect(videoData).toHaveProperty("tracks");
        expect(videoData.tracks.length).toBeGreaterThan(0);

        const transcript = videoData.tracks[0].transcript;
        expect(transcript.length).toBeGreaterThan(0);

        // Verify segment structure
        const firstSegment = transcript[0];
        expect(firstSegment).toHaveProperty("start");
        expect(firstSegment).toHaveProperty("dur");
        expect(firstSegment).toHaveProperty("text");
    });

    it("parses timestamps correctly", async () => {
        const videoId = "uJbbtrx5M_E";

        const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
            method: "POST",
            headers: {
                Authorization: `Basic ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: [videoId] }),
        });

        const data = await response.json();
        const transcript = data[0].tracks[0].transcript;
        const firstSegment = transcript[0];

        const startTime = parseFloat(firstSegment.start);
        const duration = parseFloat(firstSegment.dur);
        const endTime = startTime + duration;

        expect(startTime).toBeGreaterThanOrEqual(0);
        expect(duration).toBeGreaterThan(0);
        expect(endTime).toBeGreaterThan(startTime);
    });

    it("returns full text", async () => {
        const videoId = "uJbbtrx5M_E";

        const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
            method: "POST",
            headers: {
                Authorization: `Basic ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: [videoId] }),
        });

        const data = await response.json();
        const fullText = data[0].text;

        expect(typeof fullText).toBe("string");
        expect(fullText.length).toBeGreaterThan(0);
    });
});
