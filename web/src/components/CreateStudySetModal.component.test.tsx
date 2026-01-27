import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateStudySetModal } from "./CreateStudySetModal";

describe("CreateStudySetModal", () => {
  describe("when open", () => {
    it("renders the modal title", () => {
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(
        screen.getByRole("heading", { name: /create study set/i })
      ).toBeInTheDocument();
    });

    it("renders the name input", () => {
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it("renders the description input", () => {
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("renders create and cancel buttons", () => {
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(
        screen.getByRole("button", { name: /create/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("when closed", () => {
    it("does not render the modal content", () => {
      render(
        <CreateStudySetModal
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(
        screen.queryByRole("heading", { name: /create study set/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("allows typing in the name input", async () => {
      const user = userEvent.setup();
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "My New Study Set");

      expect(nameInput).toHaveValue("My New Study Set");
    });

    it("allows typing in the description input", async () => {
      const user = userEvent.setup();
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, "Study set description");

      expect(descInput).toHaveValue("Study set description");
    });

    it("calls onClose when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <CreateStudySetModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("disables create button when name is empty", () => {
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
    });

    it("enables create button when name is provided", async () => {
      const user = userEvent.setup();
      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Study Set");

      expect(screen.getByRole("button", { name: /create/i })).toBeEnabled();
    });
  });

  describe("form submission", () => {
    it("calls onSuccess with study set data when form is submitted", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              studySet: {
                id: 1,
                publicId: "abc123",
                name: "My Study Set",
                description: "Description",
                sourceType: "manual",
                videoId: null,
                createdAt: "2025-01-27T10:00:00Z",
                updatedAt: "2025-01-27T10:00:00Z",
              },
            },
          }),
      });

      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Study Set");
      await user.type(screen.getByLabelText(/description/i), "Description");
      await user.click(screen.getByRole("button", { name: /create/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({
          id: 1,
          publicId: "abc123",
          name: "My Study Set",
          description: "Description",
          sourceType: "manual",
          videoId: null,
          createdAt: "2025-01-27T10:00:00Z",
          updatedAt: "2025-01-27T10:00:00Z",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Study Set");
      await user.click(screen.getByRole("button", { name: /create/i }));

      expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
    });

    it("shows error message when submission fails", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Study set name already exists" },
          }),
      });

      render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Study Set");
      await user.click(screen.getByRole("button", { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/study set name already exists/i)).toBeInTheDocument();
      });
    });

    it("clears form when reopened", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Study Set");

      // Close modal
      rerender(
        <CreateStudySetModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Reopen modal
      rerender(
        <CreateStudySetModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue("");
    });
  });
});
