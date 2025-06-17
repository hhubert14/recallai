// import { NextRequest, NextResponse } from "next/server";
// import { getVideoExpiryStats, getUsersWithExpiringVideos } from "@/data-access/videos/cleanup-expired-videos";

// export async function GET(request: NextRequest) {
//     try {
//         // Optional: Add authentication for this endpoint
//         const authHeader = request.headers.get("authorization");
//         const adminSecret = process.env.ADMIN_SECRET;
        
//         if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const searchParams = request.nextUrl.searchParams;
//         const action = searchParams.get("action") || "stats";
//         const daysAhead = parseInt(searchParams.get("daysAhead") || "3");

//         if (action === "stats") {
//             const stats = await getVideoExpiryStats();
//             return NextResponse.json({
//                 success: true,
//                 data: stats,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         if (action === "expiring-users") {
//             const users = await getUsersWithExpiringVideos(daysAhead);
//             return NextResponse.json({
//                 success: true,
//                 data: {
//                     usersCount: users.length,
//                     totalExpiringVideos: users.reduce((sum, user) => sum + user.videos.length, 0),
//                     users: users
//                 },
//                 timestamp: new Date().toISOString()
//             });
//         }

//         return NextResponse.json({
//             success: false,
//             error: "Invalid action. Use 'stats' or 'expiring-users'"
//         }, { status: 400 });

//     } catch (error) {
//         console.error("Error in video expiry endpoint:", error);
        
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: "Failed to get video expiry information",
//                 details: error instanceof Error ? error.message : String(error)
//             },
//             { status: 500 }
//         );
//     }
// }
