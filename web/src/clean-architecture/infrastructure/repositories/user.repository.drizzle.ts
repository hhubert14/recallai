import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { users } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { UserEntity } from "@/clean-architecture/domain/entities/user.entity";
import { withRepositoryErrorHandling } from "./base-repository-error-handler";

export class DrizzleUserRepository implements IUserRepository {
    async createUser(id: string, email: string): Promise<UserEntity> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db.insert(users).values({ id, email }).returning();
                return this.toEntity(data);
            },
            "creating user"
        );
    }

    async findUserById(id: string): Promise<UserEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db.select().from(users).where(eq(users.id, id));
                if (!data) return null;
                return this.toEntity(data);
            },
            "finding user by id"
        );
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        return withRepositoryErrorHandling(
            async () => {
                const [data] = await db.select().from(users).where(eq(users.email, email));
                if (!data) return null;
                return this.toEntity(data);
            },
            "finding user by email"
        );
    }

    async deleteUser(id: string): Promise<void> {
        return withRepositoryErrorHandling(
            async () => {
                await db.delete(users).where(eq(users.id, id));
            },
            "deleting user"
        );
    }

    private toEntity(data: typeof users.$inferSelect): UserEntity {
        return new UserEntity(data.id, data.email);
    }
}