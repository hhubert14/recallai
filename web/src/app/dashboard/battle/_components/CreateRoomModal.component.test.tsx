import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRoomModal } from "./CreateRoomModal";
import type { StudySetForBattle } from "./types";

// Polyfill for Radix UI pointer capture (not available in JSDOM)
beforeEach(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

const mockCreateRoom = vi.fn();

vi.mock("@/hooks/useBattleLobby", () => ({
  useBattleLobby: () => ({
    createRoom: mockCreateRoom,
    isLoading: false,
    error: null,
  }),
}));

function createStudySets(): StudySetForBattle[] {
  return [
    { publicId: "set-1", name: "Biology 101", questionCount: 20 },
    { publicId: "set-2", name: "Chemistry Basics", questionCount: 10 },
    { publicId: "set-3", name: "Tiny Set", questionCount: 3 },
  ];
}

describe("CreateRoomModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal when open", () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );
    expect(
      screen.getByRole("heading", { name: /create battle room/i })
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <CreateRoomModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );
    expect(
      screen.queryByRole("heading", { name: /create battle room/i })
    ).not.toBeInTheDocument();
  });

  it("renders the study set select trigger", () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    const trigger = screen.getByRole("combobox", { name: /study set/i });
    expect(trigger).toBeInTheDocument();
  });

  it("shows password field only when private visibility is selected", async () => {
    const user = userEvent.setup();
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    // Password field should not be visible initially (default is public)
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

    // Click private radio
    await user.click(screen.getByLabelText(/private/i));
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("disables create button when no study set is selected", () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    const createButton = screen.getByRole("button", { name: /create$/i });
    expect(createButton).toBeDisabled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={onClose}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders room name input field", () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    const nameInput = screen.getByLabelText(/room name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue("");
  });

  it("renders time limit and question count selectors", () => {
    render(
      <CreateRoomModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        studySets={createStudySets()}
      />
    );

    expect(screen.getByText("Time per Question")).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
  });
});
