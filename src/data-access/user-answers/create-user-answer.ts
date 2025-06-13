import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { CreateUserAnswerDto } from "./types";

export async function createUserAnswer(userAnswer: CreateUserAnswerDto): Promise<boolean> {
    console.log("createUserAnswer called with:", userAnswer);
    
    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .from("user_answers")
            .insert([userAnswer]);

        if (error) {
            console.error("Database insert error:", error);
            throw error;
        }

        console.log("User answer created successfully");
        return true;
    } catch (error) {
        console.error("Error creating user answer:", error);
        return false;
    }
}
