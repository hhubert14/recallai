// "use server";

// import { NextRequest, NextResponse } from "next/server";
// import { createServiceRoleClient } from "@/lib/supabase/service-role";
// // Import your LLM client here

// export async function POST(
//     request: NextRequest,
//     { params }: { params: { videoId: string } }
// ) {
//     const videoId = params.videoId;
//     const supabase = createServiceRoleClient();

//     try {
//         const { authToken, operation, transcript } = await request.json();
        
//         // Validate inputs
//         if (!authToken) {
//             return NextResponse.json({ error: "Authentication token is required" }, { status: 401 });
//         }
//         if (!videoId) {
//             return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
//         }
//         if (!operation || !['questions', 'summary', 'both'].includes(operation)) {
//             return NextResponse.json({ error: "Valid operation (questions, summary, or both) is required" }, { status: 400 });
//         }
//         if (!transcript) {
//             return NextResponse.json({ error: "Video transcript is required" }, { status: 400 });
//         }

//         // Validate the auth token
//         const { data: userData, error: userError } = await supabase
//             .from("extension_tokens")
//             .select("user_id")
//             .eq("token", authToken)
//             .single();
            
//         if (userError || !userData || !userData.user_id) {
//             return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
//         }
        
//         const userId = userData.user_id;
        
//         // Verify the video exists and belongs to the user
//         const { data: videoData, error: videoError } = await supabase
//             .from("videos")
//             .select("*")
//             .eq("id", videoId)
//             .eq("user_id", userId)
//             .single();
            
//         if (videoError || !videoData) {
//             return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
//         }
        
//         let summary = null;
//         let questions = null;
        
//         // Generate content based on operation requested
//         if (operation === 'summary' || operation === 'both') {
//             // Call LLM to generate summary
//             // This is where you'd integrate with your LLM provider
//             summary = "This is a placeholder summary of the video content.";
            
//             // Store in database
//             await supabase.from("video_summaries").upsert({
//                 video_id: videoId,
//                 user_id: userId,
//                 content: summary,
//                 created_at: new Date().toISOString()
//             });
//         }
        
//         if (operation === 'questions' || operation === 'both') {
//             // Call LLM to generate questions
//             questions = [
//                 "What is the main topic of this video?",
//                 "How does the speaker support their arguments?",
//                 "What are the key takeaways from this content?",
//                 "How would you apply these concepts in a real-world scenario?",
//                 "What additional research questions does this video raise?"
//             ];
            
//             // Store in database
//             const questionsToInsert = questions.map(question => ({
//                 video_id: videoId,
//                 user_id: userId,
//                 content: question,
//                 created_at: new Date().toISOString()
//             }));
            
//             await supabase.from("video_questions").insert(questionsToInsert);
//         }
        
//         return NextResponse.json({
//             success: true,
//             data: {
//                 videoId,
//                 summary,
//                 questions
//             }
//         });
        
//     } catch (error) {
//         console.error("Error analyzing video:", error);
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//         return NextResponse.json({ error: errorMessage }, { status: 500 });
//     }
// }