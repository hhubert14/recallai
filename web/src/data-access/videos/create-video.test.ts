import { describe, it, expect, afterEach } from "vitest";
import { createVideo } from "./create-video";
import { db } from "@/drizzle";
import { videos, users } from "@/drizzle/schema";
import { createTestUser } from "@/test-helpers/factories";

describe("create-video", () => {
    afterEach(async () => {
        await db.delete(videos)
        await db.delete(users)
    })
    it("user create video", async () => {
        const user = await createTestUser()
        const video = await createVideo({
            userId: user.id,
            title: "Test title",
            url: "Test url",
        })
        expect(video).toBeDefined()
        expect(video.shouldExpire).toBe(false)
    })
})