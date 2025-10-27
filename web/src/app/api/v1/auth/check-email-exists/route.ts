"use server";

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

        const [data] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email));

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
