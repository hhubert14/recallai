"use server";

import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { users, extensionTokens } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { jsendFail, jsendSuccess, jsendError } from "@/lib/jsend";

export async function POST() {
    try {
        const supabase = await createClient();

        // Get the current user session
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        console.log("User session:", user);
        console.log("Auth error:", error);
        if (error || !user) {
            // return NextResponse.json(
            //     {
            //         error: "Not authenticated. Please sign in first.",
            //     },
            //     {
            //         status: 401,
            //     }
            // );
            return jsendFail({ error: "Not authenticated. Please sign in first." }, 401);
        }

        // Generate a random token for the extension
        const extensionToken = generateRandomToken();

        // Set expiration to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Check if user exists in our users table
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))

        if (!existingUser) {
            console.error("User not found in users table:", user.id);
            // return NextResponse.json(
            //     {
            //         error: "User not found in users table. Please create a profile first.",
            //     },
            //     {
            //         status: 404,
            //     }
            // );
            return jsendFail({ error: "User not found in users table. Please create a profile first." }, 404);
        }

        // Delete any existing extension tokens for this user
        await db.delete(extensionTokens).where(eq(extensionTokens.userId, user.id))

        // Create new extension token
        await db
            .insert(extensionTokens)
            .values({
                userId: user.id,
                token: extensionToken,
                expiresAt: expiresAt.toISOString(),
            })

        // return NextResponse.json(
        //     {
                // success: true,
                // token: extensionToken,
                // user: {
                //     // id: user.id,
                //     email: user.email,
                // },
                // expiresAt: expiresAt.toISOString(),
        //     },
        //     {
        //         status: 200,
        //     }
        // );
        return jsendSuccess({
            // success: true,
            token: extensionToken,
            user: {
                // id: user.id,
                email: user.email,
            },
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("Extension auth error:", error);
        // return NextResponse.json(
        //     {
        //         error: "Authentication failed",
        //     },
        //     {
        //         status: 500,
        //     }
        // );
        return jsendError("Authentication failed")
    }
}

// Generate a random token for extension authentication
function generateRandomToken(): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map(b => b % chars.length)
        .map(i => chars.charAt(i))
        .join("");
}
