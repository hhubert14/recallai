"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle";
import { extensionTokens, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Missing or invalid token" },
                {
                    status: 401,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Look up the token in our extension_tokens table
        const [tokenData] = await db
            .select({ userId: extensionTokens.userId, expiresAt: extensionTokens.expiresAt })
            .from(extensionTokens)
            .where(eq(extensionTokens.token, token));

        if (!tokenData) {
            return NextResponse.json(
                { error: "Invalid token" },
                {
                    status: 401,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                }
            );
        }

        // Check if token is expired
        if (new Date(tokenData.expiresAt) < new Date()) {
            // Clean up expired token
            await db.delete(extensionTokens).where(eq(extensionTokens.token, token));

            return NextResponse.json(
                { error: "Token expired" },
                {
                    status: 401,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                }
            );
        }

        // Update last_used_at (or updated_at if you kept that column name)
        await db
            .update(extensionTokens)
            .set({ updatedAt: new Date().toISOString() })
            .where(eq(extensionTokens.token, token));

        // Get user info including subscription status
        const [user] = await db
            .select({ email: users.email, isSubscribed: users.isSubscribed })
            .from(users)
            .where(eq(users.id, tokenData.userId));

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                {
                    status: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                }
            );
        }

        return NextResponse.json(
            {
                valid: true,
                isSubscribed: user.isSubscribed,
                user: {
                    email: user.email,
                },
            },
            {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization",
                },
            }
        );
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            { error: "Validation failed" },
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization",
                },
            }
        );
    }
}
