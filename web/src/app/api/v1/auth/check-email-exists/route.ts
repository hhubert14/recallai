import { type NextRequest } from "next/server";
import { CheckEmailExistsUseCase } from "@/clean-architecture/use-cases/user/check-email-exists.use-case";
import { createUserRepository } from "@/clean-architecture/infrastructure/factories/repository.factory";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";

export async function POST(request: NextRequest) {
    try {
        // const url = new URL(request.url);
        // const email = url.searchParams.get("email");
        const { email } = await request.json();

        if (!email) {
            // return NextResponse.json(
            //     { error: "Email is required" },
            //     { status: 400 }
            // );
            return jsendFail({error: "Email is required"})
        }
        const repo = createUserRepository();
        const emailExists = await new CheckEmailExistsUseCase(repo).execute(email);

        // return NextResponse.json({ emailExists });
        return jsendSuccess({emailExists})
    } catch (error) {
        console.error("Unexpected error checking email:", error);
        // return NextResponse.json(
        //     { error: "Something went wrong" },
        //     { status: 500 }
        // );
        return jsendError("Something went wrong")
    }
}
