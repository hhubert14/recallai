import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { softDeleteAllUserVideos } from "@/data-access/videos/soft-delete-all-user-videos";

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Soft delete all videos for the user
        const success = await softDeleteAllUserVideos(user.id);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete user data" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "All user data has been successfully deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
