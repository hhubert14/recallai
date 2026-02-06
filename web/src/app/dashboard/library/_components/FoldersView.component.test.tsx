import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoldersView } from "./FoldersView";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Folder: () => <svg data-testid="folder-icon" aria-label="Folder icon" />,
  MoreVertical: () => <svg data-testid="more-icon" aria-label="More options" />,
  Pencil: () => <svg data-testid="pencil-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
}));

interface TestFolder {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TestFolderWithCount extends TestFolder {
  studySetCount: number;
}

function createMockFolder(
  overrides: Partial<TestFolderWithCount> = {}
): TestFolderWithCount {
  return {
    id: 1,
    name: "Test Folder",
    description: null,
    createdAt: "2025-01-25T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
    studySetCount: 0,
    ...overrides,
  };
}

describe("FoldersView", () => {
  describe("empty state", () => {
    it("renders empty state message when no folders", () => {
      render(<FoldersView folders={[]} onFolderClick={vi.fn()} />);

      expect(screen.getByText(/no folders yet/i)).toBeInTheDocument();
    });

    it("renders new folder button in empty state", () => {
      render(<FoldersView folders={[]} onFolderClick={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: /new folder/i })
      ).toBeInTheDocument();
    });

    it("renders folders header in empty state", () => {
      render(<FoldersView folders={[]} onFolderClick={vi.fn()} />);

      expect(
        screen.getByRole("heading", { name: /folders/i })
      ).toBeInTheDocument();
    });
  });

  describe("with folders", () => {
    it("renders all folder cards", () => {
      const folders = [
        createMockFolder({ id: 1, name: "Folder 1" }),
        createMockFolder({ id: 2, name: "Folder 2" }),
        createMockFolder({ id: 3, name: "Folder 3" }),
      ];

      render(<FoldersView folders={folders} onFolderClick={vi.fn()} />);

      expect(
        screen.getByRole("heading", { name: "Folder 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Folder 2" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Folder 3" })
      ).toBeInTheDocument();
    });

    it("renders new folder button in header", () => {
      const folders = [createMockFolder()];

      render(<FoldersView folders={folders} onFolderClick={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: /new folder/i })
      ).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onFolderClick when folder is clicked", async () => {
      const user = userEvent.setup();
      const folders = [createMockFolder({ id: 42, name: "Click Me" })];
      const onFolderClick = vi.fn();

      render(
        <FoldersView folders={folders} onFolderClick={onFolderClick} />
      );

      await user.click(screen.getByRole("heading", { name: "Click Me" }));

      expect(onFolderClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 })
      );
    });

    it("calls onCreateClick when create button is clicked", async () => {
      const user = userEvent.setup();
      const folders = [createMockFolder()];
      const onCreateClick = vi.fn();

      render(
        <FoldersView
          folders={folders}
          onFolderClick={vi.fn()}
          onCreateClick={onCreateClick}
        />
      );

      await user.click(screen.getByRole("button", { name: /new folder/i }));

      expect(onCreateClick).toHaveBeenCalledTimes(1);
    });

    it("calls onEditFolder when edit is clicked on a folder", async () => {
      const user = userEvent.setup();
      const folders = [createMockFolder({ id: 42 })];
      const onEditFolder = vi.fn();

      render(
        <FoldersView
          folders={folders}
          onFolderClick={vi.fn()}
          onEditFolder={onEditFolder}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole("button", { name: /more options/i }));
      // Click edit
      await user.click(screen.getByRole("menuitem", { name: /edit/i }));

      expect(onEditFolder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 })
      );
    });

    it("calls onDeleteFolder when delete is clicked on a folder", async () => {
      const user = userEvent.setup();
      const folders = [createMockFolder({ id: 42 })];
      const onDeleteFolder = vi.fn();

      render(
        <FoldersView
          folders={folders}
          onFolderClick={vi.fn()}
          onDeleteFolder={onDeleteFolder}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole("button", { name: /more options/i }));
      // Click delete
      await user.click(screen.getByRole("menuitem", { name: /delete/i }));

      expect(onDeleteFolder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 })
      );
    });
  });

  describe("study set counts", () => {
    it("displays correct study set counts for each folder", () => {
      const folders = [
        createMockFolder({ id: 1, name: "Folder A", studySetCount: 5 }),
        createMockFolder({ id: 2, name: "Folder B", studySetCount: 1 }),
        createMockFolder({ id: 3, name: "Folder C", studySetCount: 0 }),
      ];

      render(<FoldersView folders={folders} onFolderClick={vi.fn()} />);

      expect(screen.getByText("5 study sets")).toBeInTheDocument();
      expect(screen.getByText("1 study set")).toBeInTheDocument();
      expect(screen.getByText("0 study sets")).toBeInTheDocument();
    });
  });
});
