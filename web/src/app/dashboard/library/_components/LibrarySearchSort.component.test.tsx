import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibrarySearchSort, SortOption } from "./LibrarySearchSort";

describe("LibrarySearchSort", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    sortOption: "recent" as SortOption,
    onSortChange: vi.fn(),
  };

  describe("search input", () => {
    it("renders search input with correct value", () => {
      render(<LibrarySearchSort {...defaultProps} searchQuery="test query" />);

      const searchInput = screen.getByPlaceholderText("Search study sets...");
      expect(searchInput).toHaveValue("test query");
    });

    it("renders search input with empty value by default", () => {
      render(<LibrarySearchSort {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Search study sets...");
      expect(searchInput).toHaveValue("");
    });

    it("calls onSearchChange when typing", async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(
        <LibrarySearchSort {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText("Search study sets...");
      await user.type(searchInput, "h");

      expect(onSearchChange).toHaveBeenCalledTimes(1);
      expect(onSearchChange).toHaveBeenCalledWith("h");
    });

    it("calls onSearchChange with updated value when clearing input", async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(
        <LibrarySearchSort
          {...defaultProps}
          searchQuery="test"
          onSearchChange={onSearchChange}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search study sets...");
      await user.clear(searchInput);

      expect(onSearchChange).toHaveBeenCalledWith("");
    });
  });

  describe("sort dropdown", () => {
    it("renders sort button with Recent as default", () => {
      render(<LibrarySearchSort {...defaultProps} sortOption="recent" />);

      const sortButton = screen.getByRole("button", { name: /recent/i });
      expect(sortButton).toBeInTheDocument();
    });

    it("renders sort button with A-Z when alphabetical is selected", () => {
      render(<LibrarySearchSort {...defaultProps} sortOption="alphabetical" />);

      const sortButton = screen.getByRole("button", { name: /a-z/i });
      expect(sortButton).toBeInTheDocument();
    });

    it("opens dropdown when sort button is clicked", async () => {
      const user = userEvent.setup();
      render(<LibrarySearchSort {...defaultProps} />);

      const sortButton = screen.getByRole("button", { name: /recent/i });
      await user.click(sortButton);

      expect(
        screen.getByRole("menuitemradio", { name: /recent/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitemradio", { name: /a-z/i })
      ).toBeInTheDocument();
    });

    it("calls onSortChange when selecting A-Z", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <LibrarySearchSort
          {...defaultProps}
          sortOption="recent"
          onSortChange={onSortChange}
        />
      );

      const sortButton = screen.getByRole("button", { name: /recent/i });
      await user.click(sortButton);

      const alphabeticalOption = screen.getByRole("menuitemradio", {
        name: /a-z/i,
      });
      await user.click(alphabeticalOption);

      expect(onSortChange).toHaveBeenCalledWith("alphabetical");
    });

    it("calls onSortChange when selecting Recent", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <LibrarySearchSort
          {...defaultProps}
          sortOption="alphabetical"
          onSortChange={onSortChange}
        />
      );

      const sortButton = screen.getByRole("button", { name: /a-z/i });
      await user.click(sortButton);

      const recentOption = screen.getByRole("menuitemradio", { name: /recent/i });
      await user.click(recentOption);

      expect(onSortChange).toHaveBeenCalledWith("recent");
    });

    it("shows checkmark on currently selected option", async () => {
      const user = userEvent.setup();
      render(<LibrarySearchSort {...defaultProps} sortOption="recent" />);

      const sortButton = screen.getByRole("button", { name: /recent/i });
      await user.click(sortButton);

      const recentOption = screen.getByRole("menuitemradio", { name: /recent/i });
      expect(recentOption).toHaveAttribute("data-state", "checked");

      const alphabeticalOption = screen.getByRole("menuitemradio", {
        name: /a-z/i,
      });
      expect(alphabeticalOption).toHaveAttribute("data-state", "unchecked");
    });
  });

  describe("accessibility", () => {
    it("search input has appropriate label", () => {
      render(<LibrarySearchSort {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toBeInTheDocument();
    });

    it("sort button is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<LibrarySearchSort {...defaultProps} />);

      const sortButton = screen.getByRole("button", { name: /recent/i });
      sortButton.focus();
      await user.keyboard("{Enter}");

      expect(
        screen.getByRole("menuitemradio", { name: /recent/i })
      ).toBeInTheDocument();
    });
  });
});
