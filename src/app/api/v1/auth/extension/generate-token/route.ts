"use server";

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
            return NextResponse.json(
                {
                    error: "Not authenticated. Please sign in first.",
                },
                {
                    status: 401,
                }
            );
        }

        // Generate a random token for the extension
        const extensionToken = generateRandomToken();

        // Set expiration to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Check if user exists in our users table
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!existingUser) {
            console.error("User not found in users table:", user.id);
            return NextResponse.json(
                {
                    error: "User not found in users table. Please create a profile first.",
                },
                {
                    status: 404,
                }
            );
        }

        // Delete any existing extension tokens for this user
        await supabase.from("extension_tokens").delete().eq("user_id", user.id);

        // Create new extension token
        const { data: tokenData, error: tokenError } = await supabase
            .from("extension_tokens")
            .insert({
                user_id: user.id,
                token: extensionToken,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (tokenError) {
            console.error("Error creating extension token:", tokenError);
            return NextResponse.json(
                {
                    error: "Failed to create extension token",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                token: extensionToken,
                user: {
                    // id: user.id,
                    email: user.email,
                },
                expiresAt: expiresAt.toISOString(),
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Extension auth error:", error);
        return NextResponse.json(
            {
                error: "Authentication failed",
            },
            {
                status: 500,
            }
        );
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
