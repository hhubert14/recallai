import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderCard } from "./FolderCard";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Folder: () => <svg data-testid="folder-icon" aria-label="Folder icon" />,
  MoreVertical: () => <svg data-testid="more-icon" aria-label="More options" />,
  Pencil: () => <svg data-testid="pencil-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
}));

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
    description: null,
    createdAt: "2025-01-25T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
    ...overrides,
  };
}

describe("FolderCard", () => {
  describe("content display", () => {
    it("renders the folder name", () => {
      const folder = createMockFolder({ name: "My Study Folder" });

      render(<FolderCard folder={folder} studySetCount={0} />);

      expect(
        screen.getByRole("heading", { name: "My Study Folder" })
      ).toBeInTheDocument();
    });

    it("renders the folder icon", () => {
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={0} />);

      expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
    });

    it("renders study set count as singular when count is 1", () => {
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={1} />);

      expect(screen.getByText("1 study set")).toBeInTheDocument();
    });

    it("renders study set count as plural when count is not 1", () => {
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={5} />);

      expect(screen.getByText("5 study sets")).toBeInTheDocument();
    });

    it("renders study set count as plural when count is 0", () => {
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={0} />);

      expect(screen.getByText("0 study sets")).toBeInTheDocument();
    });

    it("renders description when present", () => {
      const folder = createMockFolder({
        description: "This folder contains my study materials",
      });

      render(<FolderCard folder={folder} studySetCount={0} />);

      expect(
        screen.getByText("This folder contains my study materials")
      ).toBeInTheDocument();
    });

    it("does not render description when null", () => {
      const folder = createMockFolder({ description: null });

      render(<FolderCard folder={folder} studySetCount={0} />);

      const descriptionText = screen.queryByText(/study materials/i);
      expect(descriptionText).not.toBeInTheDocument();
    });
  });

  describe("click handling", () => {
    it("calls onClick when card is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onClick = vi.fn();

      render(
        <FolderCard folder={folder} studySetCount={0} onClick={onClick} />
      );

      await user.click(screen.getByRole("heading", { name: "Test Folder" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("keyboard accessibility", () => {
    it("has a focusable button with accessible label", () => {
      const folder = createMockFolder({ name: "My Folder" });

      render(<FolderCard folder={folder} studySetCount={0} />);

      const button = screen.getByRole("button", {
        name: /open folder my folder/i,
      });
      expect(button).toBeInTheDocument();
    });

    it("calls onClick when Enter is pressed", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onClick = vi.fn();

      render(
        <FolderCard folder={folder} studySetCount={0} onClick={onClick} />
      );

      const button = screen.getByRole("button", { name: /open folder/i });
      button.focus();
      await user.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick when Space is pressed", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onClick = vi.fn();

      render(
        <FolderCard folder={folder} studySetCount={0} onClick={onClick} />
      );

      const button = screen.getByRole("button", { name: /open folder/i });
      button.focus();
      await user.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is focusable via tab", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={0} />);

      await user.tab();

      const button = screen.getByRole("button", { name: /open folder/i });
      expect(button).toHaveFocus();
    });
  });

  describe("actions menu", () => {
    it("renders more options button", () => {
      const folder = createMockFolder();

      render(<FolderCard folder={folder} studySetCount={0} />);

      expect(
        screen.getByRole("button", { name: /more options/i })
      ).toBeInTheDocument();
    });

    it("calls onEdit when edit action is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onEdit = vi.fn();

      render(<FolderCard folder={folder} studySetCount={0} onEdit={onEdit} />);

      // Open dropdown
      await user.click(screen.getByRole("button", { name: /more options/i }));

      // Click edit
      await user.click(screen.getByRole("menuitem", { name: /edit/i }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("calls onDelete when delete action is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder();
      const onDelete = vi.fn();

      render(
        <FolderCard folder={folder} studySetCount={0} onDelete={onDelete} />
      );

      // Open dropdown
      await user.click(screen.getByRole("button", { name: /more options/i }));

      // Click delete
      await user.click(screen.getByRole("menuitem", { name: /delete/i }));

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
