import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { users } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { UserEntity } from "@/clean-architecture/domain/entities/user.entity";

export class DrizzleUserRepository implements IUserRepository {
    async createUser(email: string): Promise<UserEntity> {
        try {
            const [data] = await db.insert(users).values({ email }).returning();
            return this.toEntity(data);
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    async findUserById(id: string): Promise<UserEntity | null> {
        try {
            const [data] = await db.select().from(users).where(eq(users.id, id));
            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            console.error("Error finding user by id:", error);
            throw error;
        }
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        try {
            const [data] = await db.select().from(users).where(eq(users.email, email));
            if (!data) return null;
            return this.toEntity(data);
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await db.delete(users).where(eq(users.id, id));
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    private toEntity(data: typeof users.$inferSelect): UserEntity {
        return new UserEntity(data.id, data.email);
    }
}