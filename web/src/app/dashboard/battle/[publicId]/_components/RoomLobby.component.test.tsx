import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomLobby } from "./RoomLobby";
import type { BattleRoomDetail, BattleSlot } from "../../_components/types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useBattleLobby
const mockLeaveRoom = vi.fn().mockResolvedValue(true);
const mockUpdateSlot = vi.fn().mockResolvedValue({
  slotIndex: 0,
  slotType: "bot",
  userId: null,
  botName: "Bot",
});
const mockKickPlayer = vi.fn().mockResolvedValue({
  slotIndex: 0,
  slotType: "empty",
  userId: null,
  botName: null,
});
const mockStartGame = vi.fn().mockResolvedValue(true);

vi.mock("@/hooks/useBattleLobby", () => ({
  useBattleLobby: () => ({
    leaveRoom: mockLeaveRoom,
    updateSlot: mockUpdateSlot,
    kickPlayer: mockKickPlayer,
    startGame: mockStartGame,
    isLoading: false,
    error: null,
  }),
}));

function createRoom(
  overrides: Partial<BattleRoomDetail> = {}
): BattleRoomDetail {
  return {
    publicId: "room-abc",
    hostUserId: "host-1",
    name: "Test Room",
    visibility: "public",
    status: "waiting",
    timeLimitSeconds: 15,
    questionCount: 10,
    studySetId: 1,
    studySetName: "Biology 101",
    createdAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function createSlots(): BattleSlot[] {
  return [
    { slotIndex: 0, slotType: "player", userId: "host-1", botName: null },
    { slotIndex: 1, slotType: "empty", userId: null, botName: null },
    { slotIndex: 2, slotType: "empty", userId: null, botName: null },
    { slotIndex: 3, slotType: "empty", userId: null, botName: null },
  ];
}

describe("RoomLobby", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders room name", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );
    expect(screen.getByText("Test Room")).toBeInTheDocument();
  });

  it("renders game settings", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );
    expect(screen.getByText(/15s/)).toBeInTheDocument();
    expect(screen.getByText(/10 questions/i)).toBeInTheDocument();
    expect(screen.getByText("Biology 101")).toBeInTheDocument();
  });

  it("renders 4 slot cards", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );
    // 3 empty slots + 1 player slot
    expect(screen.getAllByText(/waiting/i)).toHaveLength(3);
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("shows host controls for host", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );
    expect(
      screen.getByRole("button", { name: /start game/i })
    ).toBeInTheDocument();
  });

  it("does not show host controls for non-host", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="user-2"
        isHost={false}
      />
    );
    expect(
      screen.queryByRole("button", { name: /start game/i })
    ).not.toBeInTheDocument();
  });

  it("shows leave button", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );
    expect(
      screen.getByRole("button", { name: /leave/i })
    ).toBeInTheDocument();
  });

  it("calls leaveRoom and navigates on leave", async () => {
    const user = userEvent.setup();
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="user-2"
        isHost={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /leave/i }));
    expect(mockLeaveRoom).toHaveBeenCalledWith("room-abc");
    expect(mockPush).toHaveBeenCalledWith("/dashboard/battle");
  });
});
