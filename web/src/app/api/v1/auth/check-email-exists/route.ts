import { type NextRequest } from "next/server";
import { CheckEmailExistsUseCase } from "@/clean-architecture/use-cases/user/check-email-exists.use-case";
import { createUserRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return jsendFail({ error: "Email is required" })
        }
        const repo = createUserRepository();
        const emailExists = await new CheckEmailExistsUseCase(repo).execute(email);

        return jsendSuccess({emailExists})
    } catch (error) {
        console.error("Unexpected error checking email:", error);
        return jsendError("Something went wrong")
    }
}
