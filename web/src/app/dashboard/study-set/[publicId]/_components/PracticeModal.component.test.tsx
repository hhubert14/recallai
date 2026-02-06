import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeModal } from "./PracticeModal";

// Mock the usePracticeChat hook
vi.mock("@/hooks/usePracticeChat", () => ({
    usePracticeChat: vi.fn(() => ({
        messages: [],
        sendMessage: vi.fn(),
        clearMessages: vi.fn(),
        isSending: false,
        error: null,
    })),
}));

const mockConceptsResponse = {
    status: "success",
    data: {
        concepts: [
            {
                conceptName: "Photosynthesis",
                description: "How plants convert light into energy",
                itemIds: ["q-1", "q-2", "f-1"],
            },
            {
                conceptName: "Cellular Respiration",
                description: "How cells break down glucose for energy",
                itemIds: ["q-3", "f-2"],
            },
        ],
    },
};

describe("PracticeModal", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it("does not render when isOpen is false", () => {
        render(
            <PracticeModal
                isOpen={false}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        expect(screen.queryByText("Practice Mode")).not.toBeInTheDocument();
    });

    it("shows loading state when fetching concepts", async () => {
        // Mock a delayed response
        vi.mocked(global.fetch).mockImplementation(
            () =>
                new Promise(() => {
                    /* never resolves */
                })
        );

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        expect(screen.getByText("Analyzing your study set...")).toBeInTheDocument();
    });

    it("displays concepts for selection after loading", async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockConceptsResponse,
        } as Response);

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Choose a Concept")).toBeInTheDocument();
        });

        expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        expect(screen.getByText("How plants convert light into energy")).toBeInTheDocument();
        expect(screen.getByText("Cellular Respiration")).toBeInTheDocument();
    });

    it("allows user to select a concept", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockConceptsResponse,
        } as Response);

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        const photosynthesisOption = screen.getByRole("radio", { name: /photosynthesis/i });
        await user.click(photosynthesisOption);

        expect(photosynthesisOption).toBeChecked();
    });

    it("transitions to chat phase after selecting concept and clicking start", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockConceptsResponse,
        } as Response);

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));

        expect(screen.getByPlaceholderText(/explain the concept/i)).toBeInTheDocument();
    });

    it("shows error message when concept loading fails", async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            json: async () => ({
                status: "fail",
                data: { error: "Failed to analyze study set" },
            }),
        } as Response);

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/failed to analyze study set/i)).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    it("allows retry after error", async () => {
        const user = userEvent.setup();
        let callCount = 0;
        vi.mocked(global.fetch).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    json: async () => ({
                        status: "fail",
                        data: { error: "Failed" },
                    }),
                } as Response);
            }
            return Promise.resolve({
                ok: true,
                json: async () => mockConceptsResponse,
            } as Response);
        });

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /retry/i }));

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });
    });

    it("displays End Session button in chat phase", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockConceptsResponse,
        } as Response);

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));

        expect(screen.getByRole("button", { name: /end session/i })).toBeInTheDocument();
    });

    it("shows feedback after ending session", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockImplementation((url) => {
            if (typeof url === "string" && url.includes("/practice/group-concepts")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConceptsResponse,
                } as Response);
            }
            if (typeof url === "string" && url.includes("/practice/generate-feedback")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        status: "success",
                        data: {
                            feedback: "Great job explaining the concept!",
                        },
                    }),
                } as Response);
            }
            return Promise.reject(new Error("Unknown URL"));
        });

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));
        await user.click(screen.getByRole("button", { name: /end session/i }));

        await waitFor(() => {
            expect(screen.getByText("Great job explaining the concept!")).toBeInTheDocument();
        });
    });

    it("shows Practice Another and Done buttons in feedback phase", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockImplementation((url) => {
            if (typeof url === "string" && url.includes("/practice/group-concepts")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConceptsResponse,
                } as Response);
            }
            if (typeof url === "string" && url.includes("/practice/generate-feedback")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        status: "success",
                        data: { feedback: "Great job!" },
                    }),
                } as Response);
            }
            return Promise.reject(new Error("Unknown URL"));
        });

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));
        await user.click(screen.getByRole("button", { name: /end session/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /practice another/i })).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
    });

    it("returns to concept selection when Practice Another is clicked", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockImplementation((url) => {
            if (typeof url === "string" && url.includes("/practice/group-concepts")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConceptsResponse,
                } as Response);
            }
            if (typeof url === "string" && url.includes("/practice/generate-feedback")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        status: "success",
                        data: { feedback: "Great job!" },
                    }),
                } as Response);
            }
            return Promise.reject(new Error("Unknown URL"));
        });

        render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));
        await user.click(screen.getByRole("button", { name: /end session/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /practice another/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /practice another/i }));

        expect(screen.getByText("Choose a Concept")).toBeInTheDocument();
    });

    it("closes modal when Done is clicked", async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockImplementation((url) => {
            if (typeof url === "string" && url.includes("/practice/group-concepts")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockConceptsResponse,
                } as Response);
            }
            if (typeof url === "string" && url.includes("/practice/generate-feedback")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        status: "success",
                        data: { feedback: "Great job!" },
                    }),
                } as Response);
            }
            return Promise.reject(new Error("Unknown URL"));
        });

        render(
            <PracticeModal
                isOpen={true}
                onClose={handleClose}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));
        await user.click(screen.getByRole("button", { name: /start practice/i }));
        await user.click(screen.getByRole("button", { name: /end session/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /done/i }));

        expect(handleClose).toHaveBeenCalled();
    });

    it("clears state when modal closes", async () => {
        const user = userEvent.setup();
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockConceptsResponse,
        } as Response);

        const { rerender } = render(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("radio", { name: /photosynthesis/i }));

        // Close the modal
        rerender(
            <PracticeModal
                isOpen={false}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        // Reopen and check if state is reset
        rerender(
            <PracticeModal
                isOpen={true}
                onClose={vi.fn()}
                studySetPublicId="test-123"
                totalItems={10}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Choose a Concept")).toBeInTheDocument();
        });

        // Should show loading first, then concepts (indicating state was reset)
        const photosynthesisOption = screen.getByRole("radio", { name: /photosynthesis/i });
        expect(photosynthesisOption).not.toBeChecked();
    });
});
