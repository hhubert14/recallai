import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestion, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";
import { db } from "@/drizzle";
import { questions, questionOptions } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export class DrizzleQuestionRepository implements IQuestionRepository {
    async createMultipleChoiceQuestion(
        videoId: number,
        questionText: string,
        options: {
            optionText: string;
            isCorrect: boolean;
            orderIndex: number;
            explanation: string | null;
        }[]
    ): Promise<MultipleChoiceQuestion> {
        try {
            // Create the question first
            const [questionData] = await db
                .insert(questions)
                .values({
                    videoId,
                    questionText,
                    questionType: "multiple_choice",
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
                        orderIndex: option.orderIndex,
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

    async findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestion[]> {
        try {
            // Join questions with their options
            const rows = await db
                .select()
                .from(questions)
                .leftJoin(questionOptions, eq(questionOptions.questionId, questions.id))
                .where(eq(questions.videoId, videoId))
                .orderBy(asc(questions.createdAt));

            // Group options by question
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

            // Convert to entities
            return Object.values(questionsMap).map(({ question, options }) =>
                this.toEntity(question, options)
            );
        } catch (error) {
            console.error("Error finding questions by video ID:", error);
            throw error;
        }
    }

    private toEntity(
        questionData: typeof questions.$inferSelect,
        optionsData: typeof questionOptions.$inferSelect[]
    ): MultipleChoiceQuestion {
        const options = optionsData.map(
            (opt) => new MultipleChoiceOption(
                opt.id,
                opt.optionText,
                opt.isCorrect,
                opt.orderIndex,
                opt.explanation
            )
        );

        return new MultipleChoiceQuestion(
            questionData.id,
            questionData.videoId,
            questionData.questionText,
            options
        );
    }
}
