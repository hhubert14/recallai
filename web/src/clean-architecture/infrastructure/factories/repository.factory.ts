import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { ISummaryRepository } from "@/clean-architecture/domain/repositories/summary.repository.interface";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";

export function createUserRepository(): IUserRepository {
    return new DrizzleUserRepository();
}

export function createVideoRepository(): IVideoRepository {
    return new DrizzleVideoRepository();
}

export function createSummaryRepository(): ISummaryRepository {
    return new DrizzleSummaryRepository();
}
