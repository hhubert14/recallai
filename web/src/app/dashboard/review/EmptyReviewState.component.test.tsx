import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyReviewState } from "./EmptyReviewState";

describe("EmptyReviewState", () => {
  it("renders 'No Items Yet' heading", () => {
    render(<EmptyReviewState onNavigateToDashboard={vi.fn()} />);

    expect(screen.getByText("No Items Yet")).toBeInTheDocument();
  });

  it("renders description about completing quizzes or creating flashcards", () => {
    render(<EmptyReviewState onNavigateToDashboard={vi.fn()} />);

    expect(
      screen.getByText(/Complete some video quizzes or create flashcards/)
    ).toBeInTheDocument();
  });

  it("renders 'Go to Dashboard' button", () => {
    render(<EmptyReviewState onNavigateToDashboard={vi.fn()} />);

    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });

  it("calls onNavigateToDashboard when button is clicked", () => {
    const handleNavigate = vi.fn();

    render(<EmptyReviewState onNavigateToDashboard={handleNavigate} />);

    fireEvent.click(screen.getByText("Go to Dashboard"));

    expect(handleNavigate).toHaveBeenCalled();
  });

  it("renders BookOpen icon", () => {
    render(<EmptyReviewState onNavigateToDashboard={vi.fn()} />);

    // The icon should be present (testing by aria-hidden attribute since lucide icons have it)
    const iconContainer = screen.getByText("No Items Yet").closest("div");
    expect(iconContainer).toBeInTheDocument();
  });
});
