import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToFolderModal } from "./AddToFolderModal";

interface FolderOption {
  id: number;
  name: string;
  isChecked: boolean;
}

const createMockFolders = (): FolderOption[] => [
  { id: 1, name: "Work", isChecked: false },
  { id: 2, name: "Personal", isChecked: true },
  { id: 3, name: "Archived", isChecked: false },
];

describe("AddToFolderModal", () => {
  const defaultProps = {
    isOpen: true,
    studySetName: "JavaScript Basics",
    folders: createMockFolders(),
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when open", () => {
    it("renders the modal with study set name in title", () => {
      render(<AddToFolderModal {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: /add to folder/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/javascript basics/i)).toBeInTheDocument();
    });

    it("renders all folders as checkboxes", () => {
      render(<AddToFolderModal {...defaultProps} />);

      expect(screen.getByLabelText("Work")).toBeInTheDocument();
      expect(screen.getByLabelText("Personal")).toBeInTheDocument();
      expect(screen.getByLabelText("Archived")).toBeInTheDocument();
    });

    it("renders folders with correct initial checked state", () => {
      render(<AddToFolderModal {...defaultProps} />);

      expect(screen.getByLabelText("Work")).not.toBeChecked();
      expect(screen.getByLabelText("Personal")).toBeChecked();
      expect(screen.getByLabelText("Archived")).not.toBeChecked();
    });

    it("renders save and cancel buttons", () => {
      render(<AddToFolderModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("when closed", () => {
    it("does not render the modal content", () => {
      render(<AddToFolderModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByRole("heading", { name: /add to folder/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("checkbox interaction", () => {
    it("allows toggling checkboxes", async () => {
      const user = userEvent.setup();
      render(<AddToFolderModal {...defaultProps} />);

      const workCheckbox = screen.getByLabelText("Work");
      expect(workCheckbox).not.toBeChecked();

      await user.click(workCheckbox);
      expect(workCheckbox).toBeChecked();

      await user.click(workCheckbox);
      expect(workCheckbox).not.toBeChecked();
    });

    it("allows checking a previously unchecked folder", async () => {
      const user = userEvent.setup();
      render(<AddToFolderModal {...defaultProps} />);

      const archivedCheckbox = screen.getByLabelText("Archived");
      await user.click(archivedCheckbox);

      expect(archivedCheckbox).toBeChecked();
    });

    it("allows unchecking a previously checked folder", async () => {
      const user = userEvent.setup();
      render(<AddToFolderModal {...defaultProps} />);

      const personalCheckbox = screen.getByLabelText("Personal");
      await user.click(personalCheckbox);

      expect(personalCheckbox).not.toBeChecked();
    });
  });

  describe("cancel button", () => {
    it("calls onClose when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<AddToFolderModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onSave when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<AddToFolderModal {...defaultProps} onSave={onSave} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe("save button", () => {
    it("calls onSave with selected folder IDs", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(<AddToFolderModal {...defaultProps} onSave={onSave} />);

      // Initial state: folder 2 is checked
      // Click save without changing anything
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith([2]);
      });
    });

    it("calls onSave with multiple folder IDs when multiple are selected", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(<AddToFolderModal {...defaultProps} onSave={onSave} />);

      // Check folder 1 (Work) in addition to already checked folder 2 (Personal)
      await user.click(screen.getByLabelText("Work"));
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith([1, 2]);
      });
    });

    it("calls onSave with empty array when no folders are selected", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(<AddToFolderModal {...defaultProps} onSave={onSave} />);

      // Uncheck the only checked folder (Personal)
      await user.click(screen.getByLabelText("Personal"));
      await user.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith([]);
      });
    });
  });

  describe("loading state", () => {
    it("disables save button when loading", () => {
      render(<AddToFolderModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });

    it("disables cancel button when loading", () => {
      render(<AddToFolderModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("disables checkboxes when loading", () => {
      render(<AddToFolderModal {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText("Work")).toBeDisabled();
      expect(screen.getByLabelText("Personal")).toBeDisabled();
      expect(screen.getByLabelText("Archived")).toBeDisabled();
    });
  });

  describe("empty state", () => {
    it("shows message when no folders exist", () => {
      render(<AddToFolderModal {...defaultProps} folders={[]} />);

      expect(screen.getByText(/no folders/i)).toBeInTheDocument();
    });

    it("shows create folder hint when no folders exist", () => {
      render(<AddToFolderModal {...defaultProps} folders={[]} />);

      expect(
        screen.getByText(/create a folder first/i)
      ).toBeInTheDocument();
    });
  });

  describe("reset on reopen", () => {
    it("resets checkbox state when modal reopens with new folders", () => {
      const { rerender } = render(<AddToFolderModal {...defaultProps} />);

      // Change the folders prop
      const newFolders = [
        { id: 1, name: "Work", isChecked: true }, // Changed from false to true
        { id: 2, name: "Personal", isChecked: false }, // Changed from true to false
        { id: 3, name: "Archived", isChecked: false },
      ];

      rerender(<AddToFolderModal {...defaultProps} folders={newFolders} />);

      expect(screen.getByLabelText("Work")).toBeChecked();
      expect(screen.getByLabelText("Personal")).not.toBeChecked();
    });
  });
});
