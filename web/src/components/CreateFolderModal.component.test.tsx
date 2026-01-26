import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateFolderModal } from "./CreateFolderModal";

describe("CreateFolderModal", () => {
  describe("when open", () => {
    it("renders the modal title", () => {
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(
        screen.getByRole("heading", { name: /create folder/i })
      ).toBeInTheDocument();
    });

    it("renders the name input", () => {
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it("renders the description input", () => {
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("renders create and cancel buttons", () => {
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
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
        <CreateFolderModal
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(
        screen.queryByRole("heading", { name: /create folder/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("allows typing in the name input", async () => {
      const user = userEvent.setup();
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "My New Folder");

      expect(nameInput).toHaveValue("My New Folder");
    });

    it("allows typing in the description input", async () => {
      const user = userEvent.setup();
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, "Folder description");

      expect(descInput).toHaveValue("Folder description");
    });

    it("calls onClose when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <CreateFolderModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("disables create button when name is empty", () => {
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
    });

    it("enables create button when name is provided", async () => {
      const user = userEvent.setup();
      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Folder");

      expect(screen.getByRole("button", { name: /create/i })).toBeEnabled();
    });
  });

  describe("form submission", () => {
    it("calls onSuccess with folder data when form is submitted", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              folder: {
                id: 1,
                name: "My Folder",
                description: "Description",
                createdAt: "2025-01-25T10:00:00Z",
                updatedAt: "2025-01-25T10:00:00Z",
              },
            },
          }),
      });

      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Folder");
      await user.type(screen.getByLabelText(/description/i), "Description");
      await user.click(screen.getByRole("button", { name: /create/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({
          id: 1,
          name: "My Folder",
          description: "Description",
          createdAt: "2025-01-25T10:00:00Z",
          updatedAt: "2025-01-25T10:00:00Z",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      // Mock fetch to never resolve (simulate slow network)
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Folder");
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
            data: { error: "Folder name already exists" },
          }),
      });

      render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Folder");
      await user.click(screen.getByRole("button", { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/folder name already exists/i)).toBeInTheDocument();
      });
    });

    it("clears form when reopened", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      await user.type(screen.getByLabelText(/name/i), "My Folder");

      // Close modal
      rerender(
        <CreateFolderModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Reopen modal
      rerender(
        <CreateFolderModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue("");
    });
  });
});
