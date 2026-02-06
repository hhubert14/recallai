import { useCallback, useState } from "react";
import { createClient } from "../client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ConnectionStatus = "untested" | "success" | "error";

export interface ConnectionTestResult {
  status: ConnectionStatus;
  error?: string;
  details?: string;
}

/**
 * Tests the Supabase connection and returns status information
 * @param customClient Optional Supabase client to use instead of creating a new one
 * @returns Promise with connection test results
 */
export async function testSupabaseConnection(
  customClient?: SupabaseClient
): Promise<ConnectionTestResult> {
  try {
    // Verify environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return {
        status: "error",
        error: "Supabase configuration missing. Check environment variables.",
      };
    }

    // Use provided client or create a new one
    const supabase = customClient || createClient();

    // Try the session API call
    const { error } = await supabase.auth.getSession();

    if (error) throw error;

    console.log("Supabase connection successful");
    return { status: "success" };
  } catch (error: unknown) {
    console.error("Supabase connection test failed:", error);
    if (error instanceof Error) {
      return {
        status: "error",
        error: error.message,
        details: error.stack,
      };
    } else {
      return {
        status: "error",
        error: "Unknown error",
        details: String(error),
      };
    }
  }
}

/**
 * Hook to use Supabase connection testing in React components
 * @param client Optional Supabase client
 * @returns Connection status and test function
 */
export function useSupabaseConnectionTest(client?: SupabaseClient) {
  const [status, setStatus] = useState<ConnectionStatus>("untested");
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    const result = await testSupabaseConnection(client);
    setStatus(result.status);
    setError(result.error || null);
    return result;
  }, [client]);

  return { status, error, runTest };
}
