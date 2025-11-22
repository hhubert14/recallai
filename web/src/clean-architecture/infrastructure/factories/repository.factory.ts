import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { IProgressRepository } from "@/clean-architecture/domain/repositories/progress.repository.interface";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";

export function createUserRepository(): IUserRepository {
    return new DrizzleUserRepository();
}

export function createVideoRepository(): IVideoRepository {
    return new DrizzleVideoRepository();
}

export function createSummaryRepository(): ISummaryRepository {
    return new DrizzleSummaryRepository();
}

export function createQuestionRepository(): IQuestionRepository {
    return new DrizzleQuestionRepository();
}

export function createAnswerRepository(): IAnswerRepository {
    return new DrizzleAnswerRepository();
}

export function createProgressRepository(): IProgressRepository {
    return new DrizzleProgressRepository();
}
