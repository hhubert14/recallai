import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { StudyDropdown } from "./StudyDropdown";
import type { StudyMode } from "./types";

describe("StudyDropdown", () => {
    it("renders a Study button", () => {
        render(<StudyDropdown onSelect={vi.fn()} />);
        expect(
            screen.getByRole("button", { name: /study/i })
        ).toBeInTheDocument();
    });

    it("opens dropdown menu when clicked", async () => {
        const user = userEvent.setup();
        render(<StudyDropdown onSelect={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: /study/i }));

        expect(screen.getByText("Flashcards")).toBeInTheDocument();
        expect(screen.getByText("Quiz")).toBeInTheDocument();
        expect(screen.getByText("Both")).toBeInTheDocument();
    });

    it("calls onSelect with 'flashcards' when Flashcards option is clicked", async () => {
        const user = userEvent.setup();
        const handleSelect = vi.fn();
        render(<StudyDropdown onSelect={handleSelect} />);

        await user.click(screen.getByRole("button", { name: /study/i }));
        await user.click(screen.getByText("Flashcards"));

        expect(handleSelect).toHaveBeenCalledWith("flashcards");
    });

    it("calls onSelect with 'quiz' when Quiz option is clicked", async () => {
        const user = userEvent.setup();
        const handleSelect = vi.fn();
        render(<StudyDropdown onSelect={handleSelect} />);

        await user.click(screen.getByRole("button", { name: /study/i }));
        await user.click(screen.getByText("Quiz"));

        expect(handleSelect).toHaveBeenCalledWith("quiz");
    });

    it("calls onSelect with 'both' when Both option is clicked", async () => {
        const user = userEvent.setup();
        const handleSelect = vi.fn();
        render(<StudyDropdown onSelect={handleSelect} />);

        await user.click(screen.getByRole("button", { name: /study/i }));
        await user.click(screen.getByText("Both"));

        expect(handleSelect).toHaveBeenCalledWith("both");
    });

    it("disables options when specified", async () => {
        const user = userEvent.setup();
        render(
            <StudyDropdown
                onSelect={vi.fn()}
                disabledModes={["flashcards", "quiz"]}
            />
        );

        await user.click(screen.getByRole("button", { name: /study/i }));

        // Get all menu items
        const menuItems = screen.getAllByRole("menuitem");
        const flashcardsItem = menuItems[0]; // First item is Flashcards
        const quizItem = menuItems[1]; // Second item is Quiz
        const bothItem = menuItems[2]; // Third item is Both

        expect(flashcardsItem).toHaveAttribute("data-disabled");
        expect(quizItem).toHaveAttribute("data-disabled");
        expect(bothItem).not.toHaveAttribute("data-disabled");
    });

    it("disables entire button when all modes are disabled", () => {
        render(
            <StudyDropdown
                onSelect={vi.fn()}
                disabledModes={["flashcards", "quiz", "both"]}
            />
        );

        expect(screen.getByRole("button", { name: /study/i })).toBeDisabled();
    });
});
