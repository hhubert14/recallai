"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateVideoQuestions } from "@/data-access/external-apis/generate-video-questions";
import { createQuestion } from "@/data-access/questions/create-question";
import { createQuestionOptions } from "@/data-access/question-options/create-question-options";

export async function POST(
    request: NextRequest,
    // { params }: { params: { url: string } }
) {
    const supabase = await createClient();

    const { video_id, title, description, transcript } = await request.json();
    console.log("Received data:", { title, description, transcript: transcript?.substring(0, 100) + "..." });

    if (!video_id || !title || !description || !transcript) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // If there's a valid user session, ensure it matches the token's user
        if (!user || error) {
            return NextResponse.json(
                {
                    error: "Unauthorized: No valid user session found",
                },
                { status: 403 }
            );
        }

        const questionData = await generateVideoQuestions(title, description, transcript);
        if (!questionData) {
            return NextResponse.json(
                { error: "Failed to generate video questions" },
                { status: 500 }
            );
        }
        
        // Return the questions directly without additional nesting
        console.log("Generated Questions Count:", questionData.questions.length);

        // Create each question and its options in the database
        for (const question of questionData.questions) {
            const createdQuestion = await createQuestion({
                video_id,
                question_text: question.question,
                question_type: "multiple_choice",
            });

            if (!createdQuestion) {
                throw new Error("Failed to create question in the database");
            }

            for (let i = 0; i < question.options.length; i++) {
                await createQuestionOptions({
                    question_id: createdQuestion.id,
                    option_text: question.options[i],
                    is_correct: i === question.correctAnswerIndex, // Assuming the correct answer is marked
                    explanation: i === question.correctAnswerIndex ? question.explanation : undefined
                });
            }
        }

        return NextResponse.json(
            questionData,
            { status: 200 }
        );
    } catch (error) {
        console.error("API route error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
