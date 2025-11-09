import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";

export function createUserRepository(): IUserRepository {
    return new DrizzleUserRepository();
}
