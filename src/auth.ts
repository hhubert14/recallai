// This file is kept for backward compatibility but now uses Supabase Auth
// You should use functions from src/lib/actions/auth.ts directly instead
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import * as authActions from "@/lib/actions/auth";

export { getSession } from "@/lib/actions/auth";

// Compatibility layer for any code still using this function
export async function signOut() {
  return authActions.signOut();
}