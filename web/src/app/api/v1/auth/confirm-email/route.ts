import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    console.log("Handling GET request for confirmation...");
    const requestUrl = new URL(request.url);
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const next = requestUrl.searchParams.get("next") || "/";

    // If there's no token hash, redirect to home
    if (!tokenHash) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    try {
        const supabase = createClient();

        const { error } = await (
            await supabase
        ).auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
        });

        if (error) {
            console.error("Error verifying email:", error);
            return NextResponse.redirect(
                new URL(
                    "/auth/error?message=Failed to confirm email",
                    request.url
                )
            );
        }

        return NextResponse.redirect(new URL(next, request.url));
    } catch (error) {
        console.error("Unexpected error during confirmation:", error);
        return NextResponse.redirect(
            new URL("/auth/error?message=Something went wrong", request.url)
        );
    }
}
