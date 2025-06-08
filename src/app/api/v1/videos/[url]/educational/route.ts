// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";


// const openaiKey = process.env.OPENAI_API_KEY;
// const client = new OpenAI();

// const completion = await client.chat.completions.create({
//     model: "gpt-4.1",
//     messages: [
//         {
//             role: "user",
//             content: "Write a one-sentence bedtime story about a unicorn.",
//         },
//     ],
// });

// console.log(completion.choices[0].message.content);
// export async function GET(
//     request: NextRequest,
//     { params }: { params: { url: string } }
// ) {
//     const videoUrl = params.url;
    
//     // Validate the video URL
//     if (!videoUrl) {
//         return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
//     }

//     // Here you would typically fetch educational content related to the video URL
//     // For demonstration, we'll return a mock response
//     const educationalContent = {
//         videoUrl,
//         title: "Sample Educational Video",
//         description: "This is a sample description for the educational video.",
//         resources: [
//             { type: "article", title: "Related Article", url: "https://example.com/article" },
//             { type: "book", title: "Related Book", url: "https://example.com/book" }
//         ]
//     };

//     return NextResponse.json(educationalContent);
// }

// const GetYoutubeTranscript = async (videoId: string) => {
//     const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`);
//     if (!response.ok) {
//         throw new Error("Failed to fetch YouTube transcript");
//     }
//     const text = await response.text();
//     // Parse the XML response to extract transcript text
//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(text, "application/xml");
//     const transcripts = Array.from(xmlDoc.getElementsByTagName("body")[0].children);
//     return transcripts.map(t => t.textContent).join(" ");
// };

// const GetYoutubeTitle = async (videoId: string) => {
//     const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
//     if (!response.ok) {
//         throw new Error("Failed to fetch YouTube video title");
//     }
//     const text = await response.text();
//     const titleMatch = text.match(/<title>(.*?)<\/title>/);
//     return titleMatch ? titleMatch[1].replace(" - YouTube", "") : "Unknown Title";
// };

// const GetYoutubeDescription = async (videoId: string) => {
//     const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
//     if (!response.ok) {
//         throw new Error("Failed to fetch YouTube video description");
//     }
//     const text = await response.text();
//     const descriptionMatch = text.match(/<meta name="description" content="(.*?)"/);
//     return descriptionMatch ? descriptionMatch[1] : "No Description Available";
// }