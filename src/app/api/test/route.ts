import { NextResponse, NextRequest } from "next/server";

// api/v1/videos/[url]/route.ts
export async function GET(request: NextRequest) {
    const youtubeUrl = encodeURIComponent(
        "https://www.youtube.com/watch?v=khH2dCs0cM4"
    );

    const response = await fetch(
        `${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({
                platform: "YouTube",
                title: "Test Video Title",
                channel_name: "Test Channel",
                duration: 300,
                category: "Test Category",
                url: "https://www.youtube.com/watch?v=khH2dCs0cM4",
                description: "Test Video Description",
                video_id: "khH2dCs0cM4",
            }),
        }
    );

    const data = await response.json();
    return NextResponse.json({
        status: response.status,
        data,
    });
}

// // api/v1/videos/[url]/educational/route.ts
// export async function GET(request: NextRequest) {
//     // Use a different video that should have captions - TED talk or educational content
//     // https://www.youtube.com/watch?v=UF8uR6Z6KLc
//     const youtubeUrl = encodeURIComponent("https://www.youtube.com/watch?v=8mzK2OVh2Rs");

//     const queryParams = new URLSearchParams();
//     queryParams.append('videoId', "8mzK2OVh2Rs");
//     queryParams.append('authToken', "7wplB57D5v4lM2tQTDcrOLFuKTU1rdXkQUulEDplm3RTcTOh5hsmclpqBG3UvRYE");
//     queryParams.append('processType', "automatic");

//     const response = await fetch(`${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}/educational?${queryParams.toString()}`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//             "Cookie": request.headers.get("cookie") || ""
//         },
//     });

//     const data = await response.json();
//     return NextResponse.json({
//         status: response.status,
//         data
//     });
// }
