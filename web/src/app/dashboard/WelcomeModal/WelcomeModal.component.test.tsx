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

  it("renders step 1 content initially", () => {
    render(<WelcomeModal {...defaultProps} />);

    expect(screen.getByText("Install the Chrome Extension")).toBeInTheDocument();
    expect(
      screen.getByText("Capture YouTube videos as you watch them.")
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("Next button advances to step 2", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Watch & Learn")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("Previous button goes back", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Go to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Watch & Learn")).toBeInTheDocument();

    // Go back to step 1
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("Install the Chrome Extension")).toBeInTheDocument();
  });

  it("shows checkmark when isExtensionInstalled: true", () => {
    render(<WelcomeModal {...defaultProps} isExtensionInstalled={true} />);

    expect(screen.getByText("Extension installed!")).toBeInTheDocument();
    // Install button should not be present
    expect(
      screen.queryByRole("link", { name: /install from chrome web store/i })
    ).not.toBeInTheDocument();
  });

  it("shows install button when isExtensionInstalled: false", () => {
    render(<WelcomeModal {...defaultProps} isExtensionInstalled={false} />);

    expect(
      screen.getByRole("link", { name: /install from chrome web store/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/check again/i)).toBeInTheDocument();
  });

  it("shows checking state when isCheckingExtension: true", () => {
    render(<WelcomeModal {...defaultProps} isCheckingExtension={true} />);

    expect(screen.getByText(/checking/i)).toBeInTheDocument();
  });

  it('"Got it" button on final step calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<WelcomeModal {...defaultProps} onComplete={onComplete} />);

    // Navigate to final step
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 2
    await user.click(screen.getByRole("button", { name: /next/i })); // Step 3

    expect(screen.getByText("Review & Remember")).toBeInTheDocument();

    // Click "Got it"
    await user.click(screen.getByRole("button", { name: /got it/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("progress bar shows correct percentage", async () => {
    const user = userEvent.setup();
    render(<WelcomeModal {...defaultProps} />);

    // Step 1 of 3 = 33.33%
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "33");

    // Step 2 of 3 = 66.67%
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(progressBar).toHaveAttribute("aria-valuenow", "67");

    // Step 3 of 3 = 100%
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

  it("calls onRecheckExtension when Check again is clicked", async () => {
    const user = userEvent.setup();
    const onRecheckExtension = vi.fn();
    render(
      <WelcomeModal {...defaultProps} onRecheckExtension={onRecheckExtension} />
    );

    await user.click(screen.getByText(/check again/i));

    expect(onRecheckExtension).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    render(<WelcomeModal {...defaultProps} open={false} />);

    expect(
      screen.queryByText("Install the Chrome Extension")
    ).not.toBeInTheDocument();
  });
});
