"use server";

// import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

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

        const supabase = await createAdminClient();

        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (error) {
            console.error("Error checking email:", error);
            return NextResponse.json(
                { error: "Failed to check email" },
                { status: 500 }
            );
        }

        // If we found a profile with this email, it exists
        const exists = !!data;

        return NextResponse.json({ exists });
    } catch (error) {
        console.error("Unexpected error checking email:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
