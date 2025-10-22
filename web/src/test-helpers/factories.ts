import { db } from "@/drizzle";
import { users, videos } from "@/drizzle/schema";

export async function createTestUser() {
    const [user] = await db
            .insert(users)
            .values({
                email: "test@example.com",
            })
            .returning()
    return user;
}

export async function createTestVideo(userId: string) {
    const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Test Title",
                url: "test.com"
            })
            .returning()
    return video;
}