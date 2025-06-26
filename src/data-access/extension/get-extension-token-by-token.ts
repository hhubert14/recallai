import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ExtensionTokenDto } from "./types";
import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";

export async function getExtensionTokenByToken(
    token: string
): Promise<ExtensionTokenDto | undefined> {
    if (!token) {
        return undefined;
    }

    const supabase = createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .from("extension_tokens")
            .select("*")
            .eq("token", token)
            .single();

        if (error) {
            logger.db.error("Error fetching token", error);
            return undefined;
        }

        return toDtoMapper(data);
    } catch (error) {
        logger.db.error("Error validating token", error);
        return undefined;
    }
}
