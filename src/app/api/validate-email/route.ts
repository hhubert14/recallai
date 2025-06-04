import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json(
            { error: "Email is required" },
            { status: 400 }
        );
    }

    const zeroBounceApiKey = process.env.ZEROBOUNCE_API_KEY;

    if (!zeroBounceApiKey) {
        console.error("ZeroBounce API key not configured");
        // Return a response that allows the signup to continue
        return NextResponse.json({
            status: "unknown",
            reason: "API key not configured",
        });
    }

    try {
        const response = await fetch(
            `https://api.zerobounce.net/v2/validate?api_key=${zeroBounceApiKey}&email=${encodeURIComponent(email)}&ip_address=`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error("ZeroBounce API error:", data.error);
            return NextResponse.json({ status: "unknown", reason: data.error });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error validating email with ZeroBounce:", error);
        return NextResponse.json(
            { status: "unknown", reason: "API error" },
            { status: 500 }
        );
    }
}
