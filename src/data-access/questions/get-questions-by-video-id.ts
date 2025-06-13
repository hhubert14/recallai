import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { QuestionDto } from "./types";

export async function getQuestionsByVideoId(videoId: number): Promise<QuestionDto[]> {
    console.log("getQuestionsByVideoId called with videoId:", videoId);
    
    if (!videoId) {
        console.log("Invalid parameters - videoId is empty");
        return [];
    }

    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("questions")
            .select(`
                *,
                question_options (
                    id,
                    question_id,
                    option_text,
                    is_correct,
                    order_index,
                    explanation,
                    created_at
                )
            `)
            .eq("video_id", videoId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Database query error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log("No questions found for video:", videoId);
            return [];
        }

        // Transform the data to match our DTO structure
        const questions: QuestionDto[] = data.map((question) => ({
            id: question.id,
            video_id: question.video_id,
            question_text: question.question_text,
            question_type: question.question_type,
            created_at: question.created_at,
            updated_at: question.updated_at,
            options: (question.question_options || []).sort((a: any, b: any) => 
                (a.order_index || 0) - (b.order_index || 0)
            )
        }));

        console.log(`Found ${questions.length} questions for video:`, videoId);
        return questions;
    } catch (error) {
        console.error("Error fetching questions by video ID:", error);
        return [];
    }
}
