import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function getQuizCompletionStatus(userId: string, videoId: number): Promise<boolean> {
    console.log("getQuizCompletionStatus called with:", { userId, videoId });
    
    if (!userId || !videoId) {
        console.log("Invalid parameters");
        return false;
    }

    const supabase = await createServiceRoleClient();

    try {
        // Get all questions for this video
        const { data: questions, error: questionsError } = await supabase
            .from("questions")
            .select("id")
            .eq("video_id", videoId);

        if (questionsError) {
            console.error("Error fetching questions:", questionsError);
            return false;
        }

        if (!questions || questions.length === 0) {
            console.log("No questions found for video:", videoId);
            return false; // No questions = can't be completed
        }

        // Get user answers for this video
        const questionIds = questions.map(q => q.id);
        const { data: userAnswers, error: answersError } = await supabase
            .from("user_answers")
            .select("question_id")
            .eq("user_id", userId)
            .in("question_id", questionIds);

        if (answersError) {
            console.error("Error fetching user answers:", answersError);
            return false;
        }

        if (!userAnswers) {
            console.log("No answers found for user:", userId);
            return false;
        }

        // Check if user answered ALL questions
        const answeredQuestionIds = userAnswers.map(a => a.question_id);
        const allQuestionsAnswered = questions.every(q => answeredQuestionIds.includes(q.id));

        console.log(`Quiz completion for video ${videoId}:`, {
            totalQuestions: questions.length,
            answeredQuestions: answeredQuestionIds.length,
            completed: allQuestionsAnswered
        });

        return allQuestionsAnswered;
    } catch (error) {
        console.error("Error checking quiz completion status:", error);
        return false;
    }
}
