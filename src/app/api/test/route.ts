import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const youtubeUrl = encodeURIComponent("https://www.youtube.com/watch?v=8mzK2OVh2Rs");

    const response = await fetch(`${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("cookie") || ""
        },
        body: JSON.stringify({
            platform: "YouTube",
            title: "Test Video Title",
            channel_name: "Test Channel",
            duration: 300,
            category: "Test Category",
            url: "https://www.youtube.com/watch?v=8mzK2OVh2Rs",
            description: "Test Video Description",
            video_id: "8mzK2OVh2Rs"
        })
    });
    
    const data = await response.json();
    return NextResponse.json({ 
        status: response.status, 
        data 
    });
}
