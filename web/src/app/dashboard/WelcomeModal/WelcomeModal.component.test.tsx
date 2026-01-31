import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WelcomeModal } from "./WelcomeModal";

describe("WelcomeModal", () => {
  const defaultProps = {
    open: true,
    onComplete: vi.fn(),
    isExtensionInstalled: false,
    isCheckingExtension: false,
    onRecheckExtension: vi.fn(),
  };

  it("renders step 1 (welcome) content initially", () => {
    render(<WelcomeModal {...defaultProps} />);

    expect(
      screen.getByText("Your AI-Powered Study Partner")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Turn any content into study materials instantly")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Practice with an AI tutor that gives feedback")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remember everything with spaced repetition")
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });

  it("Next button advances to step 2 (chrome extension)", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Supercharge Your Learning")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
  });

  it("shows checkmark when extension is installed on step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} isExtensionInstalled={true} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Extension installed!")).toBeInTheDocument();
    // Install button should not be present
    expect(
      screen.queryByRole("link", { name: /install from chrome web store/i })
    ).not.toBeInTheDocument();
  });

  it("shows install button when extension is not installed on step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} isExtensionInstalled={false} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      screen.getByRole("link", { name: /install from chrome web store/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/check again/i)).toBeInTheDocument();
  });

  it("shows checking state when isCheckingExtension is true on step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} isCheckingExtension={true} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/checking/i)).toBeInTheDocument();
  });

  it('"Get Started" button on step 2 calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<WelcomeModal {...defaultProps} onComplete={onComplete} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Supercharge Your Learning")).toBeInTheDocument();

    // Click "Get Started"
    await user.click(screen.getByRole("button", { name: /get started/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('"Skip for now" button on step 2 calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<WelcomeModal {...defaultProps} onComplete={onComplete} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Click "Skip for now"
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("progress bar shows correct percentage", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Step 1 of 2 = 50%
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");

    // Step 2 of 2 = 100%
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("closing dialog calls onComplete", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<WelcomeModal {...defaultProps} onComplete={onComplete} />);

    // Find and click the close button (X)
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onRecheckExtension when Check again is clicked on step 2", async () => {
    const user = userEvent.setup();
    const onRecheckExtension = vi.fn();
    render(
      <WelcomeModal {...defaultProps} onRecheckExtension={onRecheckExtension} />
    );

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    await user.click(screen.getByText(/check again/i));

    expect(onRecheckExtension).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    render(<WelcomeModal {...defaultProps} open={false} />);

    expect(
      screen.queryByText("Your AI-Powered Study Partner")
    ).not.toBeInTheDocument();
  });
});
