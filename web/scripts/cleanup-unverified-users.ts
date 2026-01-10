import { createClient, User } from "@supabase/supabase-js";

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL environment variable is required");
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
        "ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    );
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupUnverifiedUsers() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    console.log("Starting cleanup of unverified users...");
    console.log("Threshold date:", sevenDaysAgo.toISOString());

    // List all users using admin API
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Failed to list users:", error);
        process.exit(1);
    }

    // Filter unverified users older than 7 days
    const unverifiedUsers = data.users.filter(
        (user: User) =>
            !user.email_confirmed_at && new Date(user.created_at) < sevenDaysAgo
    );

    console.log(`Found ${unverifiedUsers.length} unverified users to delete`);

    if (unverifiedUsers.length === 0) {
        console.log("No users to clean up. Exiting.");
        process.exit(0);
    }

    let deleted = 0;
    let failed = 0;

    for (const user of unverifiedUsers) {
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) {
            console.error(`Failed to delete user ${user.id}:`, error);
            failed++;
        } else {
            console.log(`Deleted user ${user.id} (${user.email})`);
            deleted++;
        }
    }

    console.log(`Cleanup complete: ${deleted} deleted, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    }

    process.exit(0);
}

cleanupUnverifiedUsers();
