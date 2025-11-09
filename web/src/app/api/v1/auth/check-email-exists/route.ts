import { NextResponse, type NextRequest } from "next/server";
import { CheckEmailExistsUseCase } from "@/clean-architecture/use-cases/user/check-email-exists.use-case";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }
        const repo = new DrizzleUserRepository();
        const emailExists = await new CheckEmailExistsUseCase(repo).execute(email);

        return NextResponse.json({ emailExists });
    } catch (error) {
        console.error("Unexpected error checking email:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
