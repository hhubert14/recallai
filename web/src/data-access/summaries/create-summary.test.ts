import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createSummary } from "./create-summary";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { users, videos, summaries } from "@/drizzle/schema";

describe("create-summary", () => {
    let testUserId: string;
    let testVideoId: number;
    beforeEach(async () => {
        const [user] = await db
            .insert(users)
            .values({
                email: "test@example.com",
            })
            .returning()
        testUserId = user.id

        const [video] = await db
            .insert(videos)
            .values({
                userId: testUserId,
                title: "Test Title",
                url: "test.com"
            })
            .returning()
        testVideoId = video.id
        
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