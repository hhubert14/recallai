import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { UserButton } from "./user-button";

// 1. --- Mocks ---
// We tell Vitest to use our fake versions of these modules
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(), // A fake function that we can track
    }),
}));

vi.mock("@/lib/auth-provider", () => ({
    useAuth: () => ({
        user: { email: "test@example.com" }, // Our fake user data
        signOut: vi.fn(), // A fake function
    }),
}));


// 2. --- The Test Suite ---
describe("UserButton", () => {
    it("should display the user's email when logged in", async () => {
        // We need an "async" function because user actions are asynchronous
        const user = userEvent.setup();

        // Render the component
        render(<UserButton />);

        // Find the trigger button and click it to open the menu
        const triggerButton = screen.getByRole("button");
        await user.click(triggerButton);

        // Find the email text and assert that it's in the document
        const userEmail = screen.getByText("test@example.com");
        expect(userEmail).toBeInTheDocument();
    });
});