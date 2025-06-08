export type ExtensionTokenDto = {
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    updated_at: string;
    expires_at: string;
};
export type CreateExtensionTokenDto = {
    user_id: string;
    expires_at: string;
};
