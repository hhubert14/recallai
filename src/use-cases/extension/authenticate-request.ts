import { getExtensionTokenByToken } from "@/data-access/extension/get-extension-token-by-token";
import { createClient } from "@/lib/supabase/server";

// In a shared auth utility file
export async function authenticateRequest(authToken: string) {
    console.log("Authenticating request with token:", authToken);
    const supabase = await createClient();
    
    // Token validation
    const tokenData = await getExtensionTokenByToken(authToken);
    console.log("Token data retrieved:", tokenData);
    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
        return { error: "Invalid or expired token", status: 401 };
    }
    
    // Session validation (if present)
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error && tokenData.user_id !== user.id) {
        return { error: "Token doesn't match session user", status: 403 };
    }
    
    // Return authenticated user ID
    return { userId: tokenData.user_id };
}