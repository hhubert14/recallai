import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardInterface } from "./FlashcardInterface";

const mockFlashcards = [
  { id: 1, videoId: 1, front: "What is React?", back: "A JavaScript library" },
  { id: 2, videoId: 1, front: "What is Next.js?", back: "A React framework" },
  {
    id: 3,
    videoId: 1,
    front: "What is TypeScript?",
    back: "A typed superset of JavaScript",
  },
];

describe("FlashcardInterface", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: { progress: {}, created: true },
      }),
    } as Response);
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("initial render", () => {
    it("displays the first flashcard front", () => {
      render(<FlashcardInterface flashcards={mockFlashcards} />);
      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(screen.getByText("(Click to reveal answer)")).toBeInTheDocument();
    });

    it("shows progress as 1 of 3", () => {
      render(<FlashcardInterface flashcards={mockFlashcards} />);
      expect(screen.getByText("1 of 3")).toBeInTheDocument();
    });

    it("does not show self-assessment buttons before flip", () => {
      render(<FlashcardInterface flashcards={mockFlashcards} />);
      expect(
        screen.queryByText("Did you know the answer?")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Got It!")).not.toBeInTheDocument();
      expect(screen.queryByText("Not Yet")).not.toBeInTheDocument();
    });
  });

  describe("flip interaction", () => {
    it("shows the back of the card after clicking", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));

      expect(screen.getByText("A JavaScript library")).toBeInTheDocument();
      expect(screen.getByText("(Click to see question)")).toBeInTheDocument();
    });

    it("shows self-assessment buttons after flipping", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));

      expect(screen.getByText("Did you know the answer?")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Got It!" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Not Yet" })
      ).toBeInTheDocument();
    });
  });

  describe("self-assessment", () => {
    it("highlights the selected assessment button", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Flip the card
      await user.click(screen.getByText("What is React?"));

      // Select "Got It!"
      await user.click(screen.getByRole("button", { name: "Got It!" }));

      // Check Answer button should be enabled
      expect(
        screen.getByRole("button", { name: "Check Answer" })
      ).not.toBeDisabled();
    });

    it("enables Check Answer button only after selecting an option", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Flip the card
      await user.click(screen.getByText("What is React?"));

      // Check Answer should be disabled initially
      expect(
        screen.getByRole("button", { name: "Check Answer" })
      ).toBeDisabled();

      // Select an option
      await user.click(screen.getByRole("button", { name: "Not Yet" }));

      // Now it should be enabled
      expect(
        screen.getByRole("button", { name: "Check Answer" })
      ).not.toBeDisabled();
    });
  });

  describe("submit answer", () => {
    it("calls initialize-progress API with flashcardId and isCorrect=true for Got It!", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Flip, select Got It!, submit
      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/v1/reviews/initialize-progress",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flashcardId: 1, isCorrect: true }),
          })
        );
      });
    });

    it("calls initialize-progress API with isCorrect=false for Not Yet", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Flip, select Not Yet, submit
      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Not Yet" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/v1/reviews/initialize-progress",
          expect.objectContaining({
            body: JSON.stringify({ flashcardId: 1, isCorrect: false }),
          })
        );
      });
    });

    it("shows result feedback after submitting", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText("Correct!")).toBeInTheDocument();
      });
    });

    it("shows Next Card button after submitting (not last card)", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Next Card/i })
        ).toBeInTheDocument();
      });
    });

    it("disables card flip after submitting", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText("Correct!")).toBeInTheDocument();
      });

      // Card should still show the back, can't flip back to front
      expect(screen.getByText("A JavaScript library")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("advances to next card and resets state", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Complete first card
      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Next Card/i })
        ).toBeInTheDocument();
      });

      // Go to next card
      await user.click(screen.getByRole("button", { name: /Next Card/i }));

      // Should show second card front (not flipped)
      expect(screen.getByText("What is Next.js?")).toBeInTheDocument();
      expect(screen.getByText("2 of 3")).toBeInTheDocument();
      expect(
        screen.queryByText("Did you know the answer?")
      ).not.toBeInTheDocument();
    });

    it("shows Finish button on last card", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Complete all cards
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/(Click to reveal answer)/));
        await user.click(screen.getByRole("button", { name: "Got It!" }));
        await user.click(screen.getByRole("button", { name: "Check Answer" }));

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });

        if (i < 2) {
          await user.click(screen.getByRole("button", { name: /Next Card/i }));
        }
      }

      // On last card, should show Finish instead of Next Card
      expect(
        screen.getByRole("button", { name: /Finish/i })
      ).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows error message when API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ status: "error", message: "Server error" }),
      } as Response);

      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to save progress/)).toBeInTheDocument();
      });
    });

    it("shows error message when fetch throws an error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to save progress/)).toBeInTheDocument();
      });
    });

    it("still shows result and allows navigation even when error occurs", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText("Correct!")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Next Card/i })
        ).toBeInTheDocument();
      });
    });

    it("clears error when navigating to next card", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      await user.click(screen.getByText("What is React?"));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to save progress/)).toBeInTheDocument();
      });

      // Reset mock to succeed for next card
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          data: { progress: {}, created: true },
        }),
      } as Response);

      await user.click(screen.getByRole("button", { name: /Next Card/i }));

      // Error should be cleared
      expect(
        screen.queryByText(/Failed to save progress/)
      ).not.toBeInTheDocument();
    });
  });

  describe("session complete", () => {
    it("shows summary after finishing all cards", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Complete all cards with Got It!
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/(Click to reveal answer)/));
        await user.click(screen.getByRole("button", { name: "Got It!" }));
        await user.click(screen.getByRole("button", { name: "Check Answer" }));

        await waitFor(() => {
          expect(screen.getByText("Correct!")).toBeInTheDocument();
        });

        if (i < 2) {
          await user.click(screen.getByRole("button", { name: /Next Card/i }));
        } else {
          await user.click(screen.getByRole("button", { name: /Finish/i }));
        }
      }

      // Should show summary
      await waitFor(() => {
        expect(screen.getByText("Session Complete!")).toBeInTheDocument();
        expect(screen.getByText("3/3")).toBeInTheDocument();
      });
    });

    it("tracks correct count accurately", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // First card: Got It! (correct)
      await user.click(screen.getByText(/(Click to reveal answer)/));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));
      await waitFor(() =>
        expect(screen.getByText("Correct!")).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: /Next Card/i }));

      // Second card: Not Yet (incorrect)
      await user.click(screen.getByText(/(Click to reveal answer)/));
      await user.click(screen.getByRole("button", { name: "Not Yet" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));
      await waitFor(() =>
        expect(screen.getByText("Incorrect")).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: /Next Card/i }));

      // Third card: Got It! (correct)
      await user.click(screen.getByText(/(Click to reveal answer)/));
      await user.click(screen.getByRole("button", { name: "Got It!" }));
      await user.click(screen.getByRole("button", { name: "Check Answer" }));
      await waitFor(() =>
        expect(screen.getByText("Correct!")).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: /Finish/i }));

      // Summary should show 2/3
      await waitFor(() => {
        expect(screen.getByText("2/3")).toBeInTheDocument();
      });
    });

    it("allows restarting the session", async () => {
      const user = userEvent.setup();
      render(<FlashcardInterface flashcards={mockFlashcards} />);

      // Complete all cards quickly
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/(Click to reveal answer)/));
        await user.click(screen.getByRole("button", { name: "Got It!" }));
        await user.click(screen.getByRole("button", { name: "Check Answer" }));
        await waitFor(() =>
          expect(screen.getByText("Correct!")).toBeInTheDocument()
        );

        if (i < 2) {
          await user.click(screen.getByRole("button", { name: /Next Card/i }));
        } else {
          await user.click(screen.getByRole("button", { name: /Finish/i }));
        }
      }

      await waitFor(() =>
        expect(screen.getByText("Session Complete!")).toBeInTheDocument()
      );

      // Click Try Again
      await user.click(screen.getByRole("button", { name: "Try Again" }));

      // Should be back at first card
      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(screen.getByText("1 of 3")).toBeInTheDocument();
    });
  });
});
