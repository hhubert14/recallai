"use server";
// import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const { userId, email } = await request.json();
    const supabase = await createAdminClient();
    if (!userId || !email) {
        return NextResponse.json(
            { error: "User ID and email are required" },
            { status: 400 }
        );
    }
    try {
        const { error } = await supabase.from("users").insert({
            id: userId,
            email,
            is_subscribed: false,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating user profile:", error);
        return NextResponse.json(
            { error: "Failed to create user profile" },
            { status: 500 }
        );
    }
}
