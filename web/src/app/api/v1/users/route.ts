"use server";

// import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { jsendError, jsendFail, jsendSuccess } from "@/lib/jsend";

export async function POST(request: Request) {
    const { userId, email } = await request.json();
    if (!userId || !email) {
        return jsendFail({error: "User ID and email are required"})
    }
    try {
        const [newUser] = await db
        .insert(users)
        .values({
            id: userId,
            email,
            isSubscribed: false,
        })
        .returning()

        return jsendSuccess(newUser, 201)
    } catch (error) {
        console.error("Error creating user profile:", error);
        return jsendError("Failed to create user profile")
    }
}
