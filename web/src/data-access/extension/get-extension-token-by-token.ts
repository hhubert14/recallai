import { ExtensionTokenDto } from "./types";
// import { toDtoMapper } from "./utils";
import { logger } from "@/lib/logger";
import { db } from "@/drizzle";
import { extensionTokens } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getExtensionTokenByToken(
    token: string
): Promise<ExtensionTokenDto | undefined> {
    if (!token) {
        return undefined;
    }

    try {
        const [data] = await db
            .select()
            .from(extensionTokens)
            .where(eq(extensionTokens.token, token))

        if (!data) {
            logger.db.error(
                "Error fetching token (prefix: " + token.slice(0, 4) + "...)"
            );
            return undefined;
        }

        return data;
    } catch (error) {
        logger.db.error("Error validating token", error);
        return undefined;
    }
}
