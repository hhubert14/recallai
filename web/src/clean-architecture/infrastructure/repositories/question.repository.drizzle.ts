import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";
import { db } from "@/drizzle";
import { questions, questionOptions } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { withRepositoryErrorHandling } from "./base-repository-error-handler";

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
    ): Promise<MultipleChoiceQuestionEntity> {
        return withRepositoryErrorHandling(
            async () => {
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
            },
            "creating multiple choice question"
        );
    }

    async findQuestionById(questionId: number): Promise<MultipleChoiceQuestionEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
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
            },
            "finding question by ID"
        );
    }

    async findQuestionsByVideoId(videoId: number): Promise<MultipleChoiceQuestionEntity[]> {
        return withRepositoryErrorHandling(
            async () => {
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
            },
            "finding questions by video ID"
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
                opt.orderIndex,
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
