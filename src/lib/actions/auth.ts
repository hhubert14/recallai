// auth actions for server-side authentication operations
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

/**
 * Server action to sign out the current user
 */
export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

/**
 * Server action to check if user is authenticated and get session
 */
export async function getSession() {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  
  return data.session;
}

/**
 * Server action to create a new user profile after sign up
 */
export async function createUserProfile(userId: string, email: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase.from("user_profiles").insert({
    id: userId,
    email,
    subscription_tier: "free"
  });
  
  if (error) {
    console.error("Error creating user profile:", error);
    return false;
  }
  
  return true;
}