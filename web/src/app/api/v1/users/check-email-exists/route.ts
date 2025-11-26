import { type NextRequest } from "next/server";
import { CheckEmailExistsUseCase } from "@/clean-architecture/use-cases/user/check-email-exists.use-case";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return jsendFail({ error: "Email is required" })
        }
        const emailExists = await new CheckEmailExistsUseCase(new DrizzleUserRepository()).execute(email);

        return jsendSuccess({emailExists})
    } catch (error) {
        console.error("Unexpected error checking email:", error);
        return jsendError("Something went wrong")
    }
}
