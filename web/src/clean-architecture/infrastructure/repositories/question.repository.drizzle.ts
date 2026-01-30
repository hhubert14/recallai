import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";
import { db as defaultDb } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { questions, questionOptions } from "@/drizzle/schema";
import { eq, asc, inArray, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzleQuestionRepository implements IQuestionRepository {
    constructor(private readonly db: PostgresJsDatabase = defaultDb) {}

    async createMultipleChoiceQuestion(
        videoId: number | null,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }[]
    ): Promise<MultipleChoiceQuestionEntity> {
        // Create the question first
        const [questionData] = await dbRetry(() =>
            this.db
                .insert(questions)
                .values({
                    videoId,
                    questionText,
                    questionType: "multiple_choice",
                })
                .returning()
        );

        // Create all options
        const createdOptions = [];
        for (const option of options) {
            const [optionData] = await dbRetry(() =>
                this.db
                    .insert(questionOptions)
                    .values({
                        questionId: questionData.id,
                        optionText: option.optionText,
                        isCorrect: option.isCorrect,
                        explanation: option.explanation,
                    })
                    .returning()
            );

            createdOptions.push(optionData);
        }

        return this.toEntity(questionData, createdOptions);
    }

    async findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null> {
        const rows = await dbRetry(() =>
            this.db
                .select()
                .from(questions)
                .innerJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(questions.id, questionId))
        );

        if (rows.length === 0) {
            return null;
        }

        const question = rows[0].questions;
        const options = rows.map(row => row.question_options);

        return this.toEntity(question, options);
    }

    async findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]> {
        const rows = await dbRetry(() =>
            this.db
                .select()
                .from(questions)
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(questions.videoId, videoId))
                .orderBy(asc(questions.createdAt))
        );

        const questionsMap: {
            [key: number]: {
                question: typeof questions.$inferSelect;
                options: typeof questionOptions.$inferSelect[];
            }
        } = {};

        for (const row of rows) {
            if (!questionsMap[row.questions.id]) {
                questionsMap[row.questions.id] = {
                    question: row.questions,
                    options: [],
                };
            }
            if (row.question_options) {
                questionsMap[row.questions.id].options.push(row.question_options);
            }
        }

        return Object.values(questionsMap).map(({ question, options }) =>
            this.toEntity(question, options)
        );
    }

    async findQuestionsByIds(questionIds: number[]): Promise<MultipleChoiceQuestionEntity[]> {
        if (questionIds.length === 0) {
            return [];
        }

        const rows = await dbRetry(() =>
            this.db
                .select()
                .from(questions)
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(inArray(questions.id, questionIds))
                .orderBy(asc(questions.createdAt))
        );

        const questionsMap: {
            [key: number]: {
                question: typeof questions.$inferSelect;
                options: typeof questionOptions.$inferSelect[];
            }
        } = {};

        for (const row of rows) {
            if (!questionsMap[row.questions.id]) {
                questionsMap[row.questions.id] = {
                    question: row.questions,
                    options: [],
                };
            }
            if (row.question_options) {
                questionsMap[row.questions.id].options.push(row.question_options);
            }
        }

        return Object.values(questionsMap).map(({ question, options }) =>
            this.toEntity(question, options)
        );
    }

    async countQuestionsByVideoIds(videoIds: number[]): Promise<Record<number, number>> {
        if (videoIds.length === 0) {
            return {};
        }

        const rows = await dbRetry(() =>
            this.db
                .select({
                    videoId: questions.videoId,
                    count: count(),
                })
                .from(questions)
                .where(inArray(questions.videoId, videoIds))
                .groupBy(questions.videoId)
        );

        return Object.fromEntries(rows.map(r => [r.videoId, r.count]));
    }

    async updateQuestion(
        questionId: number,
        questionText: string,
        options: Array<{
            id: number;
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }>
    ): Promise<MultipleChoiceQuestionEntity> {
        // Use transaction to ensure all updates succeed or fail together
        await dbRetry(() =>
            this.db.transaction(async (tx) => {
                // Update the question text
                await tx
                    .update(questions)
                    .set({ questionText })
                    .where(eq(questions.id, questionId));

                // Update each option by its ID
                for (const option of options) {
                    await tx
                        .update(questionOptions)
                        .set({
                            optionText: option.optionText,
                            isCorrect: option.isCorrect,
                            explanation: option.explanation,
                        })
                        .where(eq(questionOptions.id, option.id));
                }
            })
        );

        // Fetch and return the updated question
        const updated = await this.findQuestionById(questionId);
        if (!updated) {
            throw new Error("Failed to fetch updated question");
        }
        return updated;
    }

    async deleteQuestion(questionId: number): Promise<void> {
        await dbRetry(() =>
            this.db
                .delete(questions)
                .where(eq(questions.id, questionId))
        );
    }

    private toEntity(
        questionData: typeof questions.$inferSelect,
        optionsData: typeof questionOptions.$inferSelect[]
    ): MultipleChoiceQuestionEntity {
        const options = optionsData.map(
            (opt) => new MultipleChoiceOption(
                opt.id,
                opt.optionText,
                opt.isCorrect,
                opt.explanation
            )
        );

        return new MultipleChoiceQuestionEntity(
            questionData.id,
            questionData.videoId,
            questionData.questionText,
            options
        );
    }
}
