import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";
import { db } from "@/drizzle";
import { questions, questionOptions, videos } from "@/drizzle/schema";
import { eq, asc, inArray } from "drizzle-orm";

export class DrizzleQuestionRepository implements IQuestionRepository {
    async createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            explanation: string | null;
        }[],
        sourceQuote: string | null,
        sourceTimestamp: number | null
    ): Promise<MultipleChoiceQuestionEntity> {
        try {
            // Create the question first
            const [questionData] = await db
                .insert(questions)
                .values({
                    videoId,
                    questionText,
                    questionType: "multiple_choice",
                    sourceQuote,
                    sourceTimestamp,
                })
                .returning();

            // Create all options
            const createdOptions = [];
            for (const option of options) {
                const [optionData] = await db
                    .insert(questionOptions)
                    .values({
                        questionId: questionData.id,
                        optionText: option.optionText,
                        isCorrect: option.isCorrect,
                        explanation: option.explanation,
                    })
                    .returning();

                createdOptions.push(optionData);
            }

            return this.toEntity(questionData, createdOptions);
        } catch (error) {
            console.error("Error creating multiple choice question:", error);
            throw error;
        }
    }

    async findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null> {
        try {
            const rows = await db
                .select()
                .from(questions)
                .innerJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(questions.id, questionId));

            if (rows.length === 0) {
                return null;
            }

            const question = rows[0].questions;
            const options = rows.map(row => row.question_options);

            return this.toEntity(question, options);
        } catch (error) {
            console.error("Error finding question by ID:", error);
            throw error;
        }
    }

    async findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]> {
        try {
            const rows = await db
                .select()
                .from(questions)
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(questions.videoId, videoId))
                .orderBy(asc(questions.createdAt));

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
        } catch (error) {
            console.error("Error finding questions by video ID:", error);
            throw error;
        }
    }

    async findQuestionsByUserId(userId: string): Promise<MultipleChoiceQuestionEntity[]> {
        try {
            const rows = await db
                .select()
                .from(questions)
                .innerJoin(videos, eq(videos.id, questions.videoId))
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(videos.userId, userId))
                .orderBy(asc(questions.createdAt));

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
        } catch (error) {
            console.error("Error finding questions by user ID:", error);
            throw error;
        }
    }

    async findQuestionsByIds(questionIds: number[]): Promise<MultipleChoiceQuestionEntity[]> {
        if (questionIds.length === 0) {
            return [];
        }

        try {
            const rows = await db
                .select()
                .from(questions)
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(inArray(questions.id, questionIds))
                .orderBy(asc(questions.createdAt));

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
        } catch (error) {
            console.error("Error finding questions by IDs:", error);
            throw error;
        }
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
            options,
            questionData.sourceQuote,
            questionData.sourceTimestamp
        );
    }
}
