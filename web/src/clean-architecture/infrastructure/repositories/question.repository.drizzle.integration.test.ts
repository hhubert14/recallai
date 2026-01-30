import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { users, videos } from "@/drizzle/schema";
import { DrizzleQuestionRepository } from "./question.repository.drizzle";
import {
    createTestContext,
    IntegrationTestContext,
} from "@/test-utils/integration-test-context";

/**
 * Integration tests for DrizzleQuestionRepository
 *
 * Requires test database to be running:
 *   npm run db:migrate:test
 *
 * Run with:
 *   npm run test:integration
 */

describe("DrizzleQuestionRepository (integration)", () => {
    const TEST_DATABASE_URL = process.env.DATABASE_URL;

    if (!TEST_DATABASE_URL?.includes("testdb")) {
        it("fails when test database is not configured", () => {
            throw new Error(
                "Integration tests require DATABASE_URL pointing to testdb. " +
                "Ensure .env.test.local is configured and run: npm run test:integration"
            );
        });
        return;
    }

    let ctx: IntegrationTestContext;
    let repository: DrizzleQuestionRepository;

    // Test data IDs
    let testUserId: string;
    let testVideoId: number;

    beforeEach(async () => {
        ctx = await createTestContext();
        repository = new DrizzleQuestionRepository(ctx.db);

        // Create test user (must insert into auth.users first due to FK constraint)
        testUserId = crypto.randomUUID();
        await ctx.sql`INSERT INTO auth.users (id, email) VALUES (${testUserId}, 'test@example.com')`;
        await ctx.db.insert(users).values({
            id: testUserId,
            email: "test@example.com",
        });

        // Create test video
        const [video] = await ctx.db
            .insert(videos)
            .values({
                userId: testUserId,
                title: "Test Video",
                channelName: "Test Channel",
                url: "https://youtube.com/watch?v=test123",
            })
            .returning();
        testVideoId = video.id;
    });

    afterEach(async () => {
        await ctx.cleanup();
    });

    describe("updateQuestion", () => {
        it("updates question text and options in a transaction", async () => {
            // Create a question first
            const created = await repository.createMultipleChoiceQuestion(
                testVideoId,
                "Original question text",
                [
                    { optionText: "Option A", isCorrect: true, explanation: "Correct!" },
                    { optionText: "Option B", isCorrect: false, explanation: null },
                    { optionText: "Option C", isCorrect: false, explanation: null },
                    { optionText: "Option D", isCorrect: false, explanation: null },
                ]
            );

            // Prepare updated options (using the actual option IDs)
            const updatedOptions = created.options.map((opt, index) => ({
                id: opt.id,
                optionText: `Updated Option ${index + 1}`,
                isCorrect: index === 1, // Change correct answer to option B
                explanation: index === 1 ? "Now correct" : null,
            }));

            // Update the question
            const result = await repository.updateQuestion(
                created.id,
                "Updated question text",
                updatedOptions
            );

            // Verify the result
            expect(result.id).toBe(created.id);
            expect(result.questionText).toBe("Updated question text");
            expect(result.options).toHaveLength(4);

            // Verify options were updated
            const correctOption = result.options.find(opt => opt.isCorrect);
            expect(correctOption?.optionText).toBe("Updated Option 2");
            expect(correctOption?.explanation).toBe("Now correct");
        });

        it("persists changes after update", async () => {
            // Create a question
            const created = await repository.createMultipleChoiceQuestion(
                testVideoId,
                "Original text",
                [
                    { optionText: "A", isCorrect: true, explanation: null },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ]
            );

            // Update
            const updatedOptions = created.options.map((opt, index) => ({
                id: opt.id,
                optionText: `New ${index + 1}`,
                isCorrect: index === 2, // Option C is now correct
                explanation: null,
            }));

            await repository.updateQuestion(
                created.id,
                "New question text",
                updatedOptions
            );

            // Fetch again to verify persistence
            const fetched = await repository.findQuestionById(created.id);

            expect(fetched).not.toBeNull();
            expect(fetched!.questionText).toBe("New question text");
            expect(fetched!.options.find(opt => opt.isCorrect)?.optionText).toBe("New 3");
        });

        it("preserves videoId after update", async () => {
            const created = await repository.createMultipleChoiceQuestion(
                testVideoId,
                "Question with video",
                [
                    { optionText: "A", isCorrect: true, explanation: null },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ]
            );

            const updatedOptions = created.options.map(opt => ({
                id: opt.id,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                explanation: opt.explanation,
            }));

            const result = await repository.updateQuestion(
                created.id,
                "Updated text",
                updatedOptions
            );

            expect(result.videoId).toBe(testVideoId);
        });

        it("updates all options atomically", async () => {
            const created = await repository.createMultipleChoiceQuestion(
                null, // No video
                "Question",
                [
                    { optionText: "Old A", isCorrect: false, explanation: null },
                    { optionText: "Old B", isCorrect: false, explanation: null },
                    { optionText: "Old C", isCorrect: true, explanation: "Was correct" },
                    { optionText: "Old D", isCorrect: false, explanation: null },
                ]
            );

            const updatedOptions = [
                { id: created.options[0].id, optionText: "New A", isCorrect: true, explanation: "Now correct" },
                { id: created.options[1].id, optionText: "New B", isCorrect: false, explanation: null },
                { id: created.options[2].id, optionText: "New C", isCorrect: false, explanation: null },
                { id: created.options[3].id, optionText: "New D", isCorrect: false, explanation: null },
            ];

            const result = await repository.updateQuestion(
                created.id,
                "Updated question",
                updatedOptions
            );

            // Verify all 4 options were updated
            expect(result.options.filter(opt => opt.optionText.startsWith("New"))).toHaveLength(4);
            expect(result.options.filter(opt => opt.isCorrect)).toHaveLength(1);
            expect(result.options.find(opt => opt.isCorrect)?.optionText).toBe("New A");
        });
    });

    describe("findQuestionById", () => {
        it("returns question with all options", async () => {
            const created = await repository.createMultipleChoiceQuestion(
                testVideoId,
                "Test question",
                [
                    { optionText: "A", isCorrect: true, explanation: "Correct" },
                    { optionText: "B", isCorrect: false, explanation: null },
                    { optionText: "C", isCorrect: false, explanation: null },
                    { optionText: "D", isCorrect: false, explanation: null },
                ]
            );

            const found = await repository.findQuestionById(created.id);

            expect(found).not.toBeNull();
            expect(found!.id).toBe(created.id);
            expect(found!.questionText).toBe("Test question");
            expect(found!.videoId).toBe(testVideoId);
            expect(found!.options).toHaveLength(4);
        });

        it("returns null for non-existent question", async () => {
            const found = await repository.findQuestionById(99999);
            expect(found).toBeNull();
        });
    });
});
