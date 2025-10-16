import { ExtensionTokenDto } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDtoMapper(token: any): ExtensionTokenDto {
    return {
        id: token.id,
        user_id: token.user_id,
        token: token.token,
        created_at: token.created_at,
        updated_at: token.updated_at,
        expires_at: token.expires_at,
    };
}
