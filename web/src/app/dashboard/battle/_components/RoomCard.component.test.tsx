import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomCard } from "./RoomCard";
import type { BattleRoomSummary } from "./types";

function createMockRoom(
  overrides: Partial<BattleRoomSummary> = {}
): BattleRoomSummary {
  return {
    publicId: "room-1",
    name: "Test Room",
    visibility: "public",
    timeLimitSeconds: 15,
    questionCount: 10,
    studySetName: "Biology 101",
    createdAt: "2025-01-01T00:00:00Z",
    slotSummary: {
      playerCount: 1,
      botCount: 0,
      openSlots: 3,
    },
    ...overrides,
  };
}

describe("RoomCard", () => {
  it("renders room name", () => {
    render(<RoomCard room={createMockRoom()} onJoin={vi.fn()} />);
    expect(screen.getByText("Test Room")).toBeInTheDocument();
  });

  it("renders study set name", () => {
    render(<RoomCard room={createMockRoom()} onJoin={vi.fn()} />);
    expect(screen.getByText("Biology 101")).toBeInTheDocument();
  });

  it("renders player count based on non-locked slots", () => {
    render(
      <RoomCard
        room={createMockRoom({
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 0 },
        })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByText("1/1")).toBeInTheDocument();
  });

  it("renders player count with mixed slot types", () => {
    render(
      <RoomCard
        room={createMockRoom({
          slotSummary: { playerCount: 2, botCount: 1, openSlots: 1 },
        })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByText("3/4")).toBeInTheDocument();
  });

  it("renders time limit", () => {
    render(
      <RoomCard
        room={createMockRoom({ timeLimitSeconds: 20 })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByText("20s")).toBeInTheDocument();
  });

  it("shows lock icon for private rooms", () => {
    render(
      <RoomCard
        room={createMockRoom({ visibility: "private" })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Private room")).toBeInTheDocument();
  });

  it("does not show lock icon for public rooms", () => {
    render(
      <RoomCard
        room={createMockRoom({ visibility: "public" })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.queryByLabelText("Private room")).not.toBeInTheDocument();
  });

  it("calls onJoin with publicId when Join button clicked", async () => {
    const user = userEvent.setup();
    const onJoin = vi.fn();
    render(<RoomCard room={createMockRoom()} onJoin={onJoin} />);

    await user.click(screen.getByRole("button", { name: /join/i }));
    expect(onJoin).toHaveBeenCalledWith("room-1");
  });

  it("disables Join button when no open slots", () => {
    render(
      <RoomCard
        room={createMockRoom({
          slotSummary: { playerCount: 4, botCount: 0, openSlots: 0 },
        })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /full/i })).toBeDisabled();
  });

  it("renders question count", () => {
    render(
      <RoomCard
        room={createMockRoom({ questionCount: 15 })}
        onJoin={vi.fn()}
      />
    );
    expect(screen.getByText("15 Qs")).toBeInTheDocument();
  });
});
