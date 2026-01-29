import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddVideoModal } from "./AddVideoModal";

describe("AddVideoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when open", () => {
    it("renders the modal title", () => {
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(
        screen.getByRole("heading", { name: /add video/i })
      ).toBeInTheDocument();
    });

    it("renders the URL input with label", () => {
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/youtube url/i)).toBeInTheDocument();
    });

    it("renders Add and Cancel buttons", () => {
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("when closed", () => {
    it("does not render the modal content", () => {
      render(
        <AddVideoModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(
        screen.queryByRole("heading", { name: /add video/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("disables Add button when URL input is empty", () => {
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: /^add$/i })).toBeDisabled();
    });

    it("enables Add button when URL is provided", async () => {
      const user = userEvent.setup();
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );

      expect(screen.getByRole("button", { name: /^add$/i })).toBeEnabled();
    });

    it("shows client-side validation error for invalid YouTube URL", async () => {
      const user = userEvent.setup();
      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.google.com"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        /please enter a valid youtube url/i
      );
    });
  });

  describe("form submission", () => {
    it("shows loading state during API call", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
    });

    it("disables form inputs while loading", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      expect(screen.getByLabelText(/youtube url/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("shows error message when video already exists", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              alreadyExists: true,
              studySetPublicId: "abc123",
            },
          }),
      });

      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /this video is already in your library/i
        );
      });
    });

    it("shows error message on API failure", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Failed to process video" },
          }),
      });

      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /failed to process video/i
        );
      });
    });

    it("calls onSuccess with studySetPublicId on successful processing", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              alreadyExists: false,
              studySetPublicId: "xyz789",
            },
          }),
      });

      render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("xyz789");
      });
    });

    it("calls onClose when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <AddVideoModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("form reset", () => {
    it("resets form when modal is reopened", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );

      // Close modal
      rerender(
        <AddVideoModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Reopen modal
      rerender(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/youtube url/i)).toHaveValue("");
    });

    it("clears error when modal is reopened", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Some error" },
          }),
      });

      const { rerender } = render(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(
        screen.getByLabelText(/youtube url/i),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
      await user.click(screen.getByRole("button", { name: /^add$/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Close modal
      rerender(
        <AddVideoModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Reopen modal
      rerender(
        <AddVideoModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
