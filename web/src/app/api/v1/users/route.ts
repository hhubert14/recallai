"use server";

import { jsendError, jsendFail, jsendSuccess } from "@/lib/jsend";
import { CreateUserUseCase } from "@/clean-architecture/use-cases/user/create-user.use-case";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";

export async function POST(request: Request) {
    const { userId, email } = await request.json();
    if (!userId || !email) {
        return jsendFail({ error: "User ID and email are required" });
    }
    try {
        const newUser = await new CreateUserUseCase(new DrizzleUserRepository()).execute(userId, email);

        return jsendSuccess(newUser, 201);
    } catch (error) {
        console.error("Error creating user profile:", error);
        return jsendError("Failed to create user profile");
    }
}
