import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createSummary } from "./create-summary";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { users, videos, summaries } from "@/drizzle/schema";
import { createTestUser, createTestVideo } from "@/test-helpers/factories";

describe("create-summary", () => {
    let testUserId: string;
    let testVideoId: number;
    beforeEach(async () => {
        const user = await createTestUser();
        const video = await createTestVideo(user.id);
        testUserId = user.id;
        testVideoId = video.id;
      });

    afterEach(async () => {
        await db.delete(summaries).where(eq(summaries.videoId, testVideoId));
        await db.delete(videos).where(eq(videos.id, testVideoId));
        await db.delete(users).where(eq(users.id, testUserId));
    });

    it("add summary to db", async () => {
        const testData = {
            videoId: testVideoId,
            content: "Test summary"
        }
        const result = await createSummary(testData);
        expect(result).toBeDefined();
        expect(result.content).toBe("Test summary");
        expect(result.videoId).toBe(testVideoId);
    })
})