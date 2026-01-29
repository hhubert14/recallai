import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { users } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { dbRetry } from "@/lib/db";
import { eq } from "drizzle-orm";
import { UserEntity } from "@/clean-architecture/domain/entities/user.entity";

export class DrizzleUserRepository implements IUserRepository {
    async createUser(id: string, email: string): Promise<UserEntity> {
        const [data] = await dbRetry(() =>
            db.insert(users).values({ id, email }).returning()
        );
        return this.toEntity(data);
    }

    async findUserById(id: string): Promise<UserEntity | null> {
        const [data] = await dbRetry(() =>
            db.select().from(users).where(eq(users.id, id))
        );
        if (!data) return null;
        return this.toEntity(data);
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        const [data] = await dbRetry(() =>
            db.select().from(users).where(eq(users.email, email))
        );
        if (!data) return null;
        return this.toEntity(data);
    }

    async deleteUser(id: string): Promise<void> {
        await dbRetry(() =>
            db.delete(users).where(eq(users.id, id))
        );
    }

    private toEntity(data: typeof users.$inferSelect): UserEntity {
        return new UserEntity(data.id, data.email);
    }
}
