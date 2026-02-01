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
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("Next button advances to step 2 (chrome extension)", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Supercharge Your Learning")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
  });

  it("does not show Back button on step 1", () => {
    render(<WelcomeModal {...defaultProps} />);

    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  it("shows Back button on step 2 and navigates back to step 1", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();

    // Click Back
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("shows Back button on step 3 and navigates back to step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 3
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();

    // Click Back
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
  });

  it("shows Back button on step 5 and navigates back to step 4", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 5
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();

    // Click Back
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
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

  it("shows Next button on step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Supercharge Your Learning")).toBeInTheDocument();

    // Should have Next button (not Get Started) because there are more steps
    expect(screen.getByRole("button", { name: /^next$/i })).toBeInTheDocument();
  });

  it("progress bar shows correct percentage for 5 steps", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    const progressBar = screen.getByRole("progressbar");

    // Step 1 of 5 = 20%
    expect(progressBar).toHaveAttribute("aria-valuenow", "20");

    // Step 2 of 5 = 40%
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(progressBar).toHaveAttribute("aria-valuenow", "40");

    // Step 3 of 5 = 60%
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(progressBar).toHaveAttribute("aria-valuenow", "60");

    // Step 4 of 5 = 80%
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(progressBar).toHaveAttribute("aria-valuenow", "80");

    // Step 5 of 5 = 100%
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

  // Step 3 (Pin Extension) Tests
  it("renders step 3 (pin extension) with video demo", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 3
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
    expect(screen.getByText("Pin the Extension")).toBeInTheDocument();
    // Should show video demo
    expect(screen.getByTestId("pin-extension-video")).toBeInTheDocument();
  });

  // Step 4 (Extension Demo) Tests
  it("renders step 4 (extension demo) with video demo", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 4
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
    expect(screen.getByText("See It In Action")).toBeInTheDocument();
    // Should show video demo
    expect(screen.getByTestId("extension-demo-video")).toBeInTheDocument();
  });

  // Step 5 (Create First Study Set) Tests
  it("renders step 5 with CTA buttons", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 5
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    expect(screen.getByText("Create Your First Study Set")).toBeInTheDocument();

    // Should have two CTA buttons
    expect(screen.getByRole("button", { name: /import from youtube/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create manually/i })).toBeInTheDocument();
  });

  it('"Import from YouTube" button opens AddVideoModal', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 5
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Click "Import from YouTube"
    await user.click(screen.getByRole("button", { name: /import from youtube/i }));

    // AddVideoModal should be visible
    expect(screen.getByText("Paste a YouTube URL to add a video to your library.")).toBeInTheDocument();
  });

  it('"Create Manually" button opens CreateStudySetModal', async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Navigate to step 5
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Click "Create Manually"
    await user.click(screen.getByRole("button", { name: /create manually/i }));

    // CreateStudySetModal should be visible
    expect(screen.getByText("Create a new study set to organize your flashcards and questions.")).toBeInTheDocument();
  });

  it('"Skip for now" button on step 5 calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<WelcomeModal {...defaultProps} onComplete={onComplete} />);

    // Navigate to step 5
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Click "Skip for now"
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
