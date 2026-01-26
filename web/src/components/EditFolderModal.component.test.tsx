import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditFolderModal } from "./EditFolderModal";

interface TestFolder {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

function createMockFolder(overrides: Partial<TestFolder> = {}): TestFolder {
  return {
    id: 1,
    name: "Test Folder",
    description: "Test description",
    createdAt: "2025-01-25T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
    ...overrides,
  };
}

describe("EditFolderModal", () => {
  describe("when open", () => {
    it("renders the modal title", () => {
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(
        screen.getByRole("heading", { name: /edit folder/i })
      ).toBeInTheDocument();
    });

    it("pre-fills the name input with folder name", () => {
      const folder = createMockFolder({ name: "My Folder" });
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue("My Folder");
    });

    it("pre-fills the description input with folder description", () => {
      const folder = createMockFolder({ description: "Folder description" });
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/description/i)).toHaveValue(
        "Folder description"
      );
    });

    it("shows empty description input when folder has no description", () => {
      const folder = createMockFolder({ description: null });
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/description/i)).toHaveValue("");
    });

    it("renders save, delete, and cancel buttons", () => {
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("when closed", () => {
    it("does not render the modal content", () => {
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={false}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(
        screen.queryByRole("heading", { name: /edit folder/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("allows editing the name", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Old Name" });
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");

      expect(nameInput).toHaveValue("New Name");
    });

    it("calls onClose when cancel is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onClose = vi.fn();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={onClose}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("disables save button when name is empty", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);

      expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("calls onSuccess with updated folder data when form is submitted", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ id: 42 });
      const onSuccess = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              folder: {
                id: 42,
                name: "Updated Name",
                description: "Updated Description",
                createdAt: "2025-01-25T10:00:00Z",
                updatedAt: "2025-01-25T11:00:00Z",
              },
            },
          }),
      });

      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={onSuccess}
          onDelete={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      const descInput = screen.getByLabelText(/description/i);
      await user.clear(descInput);
      await user.type(descInput, "Updated Description");

      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({
          id: 42,
          name: "Updated Name",
          description: "Updated Description",
          createdAt: "2025-01-25T10:00:00Z",
          updatedAt: "2025-01-25T11:00:00Z",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();

      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });
  });

  describe("delete functionality", () => {
    it("shows delete confirmation when delete button is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(
        screen.getByText(/are you sure you want to delete/i)
      ).toBeInTheDocument();
    });

    it("calls onDelete when delete is confirmed", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ id: 42 });
      const onDelete = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: { message: "Folder deleted" },
          }),
      });

      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={onDelete}
        />
      );

      await user.click(screen.getByRole("button", { name: /delete/i }));
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(42);
      });
    });

    it("hides confirmation when cancel is clicked during delete", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      render(
        <EditFolderModal
          isOpen={true}
          folder={folder}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /delete/i }));
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(
        screen.queryByText(/are you sure you want to delete/i)
      ).not.toBeInTheDocument();
    });
  });
});
