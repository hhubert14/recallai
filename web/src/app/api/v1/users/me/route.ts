import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { jsendSuccess, jsendFail } from "@/lib/jsend";

export async function GET() {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
        return jsendFail({ error: "Not authenticated" }, 401);
    }

    return jsendSuccess({
        user: {
            id: user.id,
            email: user.email,
        },
    });
}
