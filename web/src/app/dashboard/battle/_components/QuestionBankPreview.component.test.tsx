import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionBankPreview } from "./QuestionBankPreview";

describe("QuestionBankPreview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders trigger button", () => {
    render(<QuestionBankPreview roomPublicId="room-1" />);
    expect(
      screen.getByRole("button", { name: /preview questions/i })
    ).toBeInTheDocument();
  });

  it("shows loading state after opening", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves

    render(<QuestionBankPreview roomPublicId="room-1" />);
    await user.click(
      screen.getByRole("button", { name: /preview questions/i })
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders question texts and answer options after fetch", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "success",
          data: {
            questions: [
              {
                questionText: "What is DNA?",
                options: ["Deoxyribonucleic acid", "Protein", "Lipid", "Sugar"],
              },
              {
                questionText: "What is RNA?",
                options: ["Ribonucleic acid", "Enzyme", "Mineral", "Vitamin"],
              },
            ],
          },
        }),
    });

    render(<QuestionBankPreview roomPublicId="room-1" />);
    await user.click(
      screen.getByRole("button", { name: /preview questions/i })
    );

    await waitFor(() => {
      expect(screen.getByText("What is DNA?")).toBeInTheDocument();
      expect(screen.getByText(/Deoxyribonucleic acid/)).toBeInTheDocument();
      expect(screen.getByText(/Protein/)).toBeInTheDocument();
      expect(screen.getByText("What is RNA?")).toBeInTheDocument();
      expect(screen.getByText(/Ribonucleic acid/)).toBeInTheDocument();
    });
  });

  it("shows error state on fetch failure", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          status: "fail",
          data: { error: "Battle room not found" },
        }),
    });

    render(<QuestionBankPreview roomPublicId="room-1" />);
    await user.click(
      screen.getByRole("button", { name: /preview questions/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it("shows empty state when no questions", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "success",
          data: { questions: [] },
        }),
    });

    render(<QuestionBankPreview roomPublicId="room-1" />);
    await user.click(
      screen.getByRole("button", { name: /preview questions/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/no questions/i)).toBeInTheDocument();
    });
  });
});
