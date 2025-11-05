"use server";

import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";

export async function POST(request: Request) {
    const { userId, email } = await request.json();
    if (!userId || !email) {
        return NextResponse.json(
            { error: "User ID and email are required" },
            { status: 400 }
        );
    }
    try {
        await db
        .insert(users)
        .values({
            id: userId,
            email,
            isSubscribed: false,
        })

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating user profile:", error);
        return NextResponse.json(
            { error: "Failed to create user profile" },
            { status: 500 }
        );
    }
}
