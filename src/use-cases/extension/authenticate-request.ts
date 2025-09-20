import { getExtensionTokenByToken } from "@/data-access/extension/get-extension-token-by-token";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// In a shared auth utility file
export async function authenticateRequest(authToken: string) {
    logger.extension.debug("Authenticating request", {
        tokenLength: authToken?.length,
    });
    const supabase = await createClient();

    // Token validation
    const tokenData = await getExtensionTokenByToken(authToken);
    logger.extension.debug("Token data retrieved", {
        hasToken: !!tokenData,
        userId: tokenData?.user_id,
        isExpired: tokenData
            ? new Date(tokenData.expires_at) < new Date()
            : null,
    });
    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
        return { error: "Invalid or expired token", status: 401 };
    }

    // Session validation (if present)
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();
    if (user && !error && tokenData.user_id !== user.id) {
        return { error: "Token doesn't match session user", status: 403 };
    }

    // Return authenticated user ID
    return { userId: tokenData.user_id };
}
