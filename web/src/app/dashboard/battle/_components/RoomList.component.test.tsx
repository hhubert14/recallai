import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomList } from "./RoomList";
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

describe("RoomList", () => {
  it("renders empty state when no rooms", () => {
    render(<RoomList rooms={[]} onJoinRoom={vi.fn()} />);
    expect(
      screen.getByText(/no battle rooms available/i)
    ).toBeInTheDocument();
  });

  it("renders all room cards", () => {
    const rooms = [
      createMockRoom({ publicId: "r1", name: "Room 1" }),
      createMockRoom({ publicId: "r2", name: "Room 2" }),
      createMockRoom({ publicId: "r3", name: "Room 3" }),
    ];
    render(<RoomList rooms={rooms} onJoinRoom={vi.fn()} />);

    expect(screen.getByText("Room 1")).toBeInTheDocument();
    expect(screen.getByText("Room 2")).toBeInTheDocument();
    expect(screen.getByText("Room 3")).toBeInTheDocument();
  });

  it("passes onJoinRoom to room cards", async () => {
    const user = userEvent.setup();
    const onJoinRoom = vi.fn();
    const rooms = [createMockRoom({ publicId: "r1", name: "Room 1" })];
    render(<RoomList rooms={rooms} onJoinRoom={onJoinRoom} />);

    await user.click(screen.getByRole("button", { name: /join/i }));
    expect(onJoinRoom).toHaveBeenCalledWith("r1");
  });
});
