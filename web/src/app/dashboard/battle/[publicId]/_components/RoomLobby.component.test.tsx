import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomLobby } from "./RoomLobby";
import type { BattleRoomDetail, BattleSlot } from "../../_components/types";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
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

const mockCloseRoom = vi.fn().mockResolvedValue(true);

vi.mock("@/hooks/useBattleLobby", () => ({
  useBattleLobby: () => ({
    leaveRoom: mockLeaveRoom,
    closeRoom: mockCloseRoom,
    updateSlot: mockUpdateSlot,
    kickPlayer: mockKickPlayer,
    startGame: mockStartGame,
    isLoading: false,
    error: null,
  }),
}));

// Hoist mock variables used inside vi.mock factories
const { mockChannelInstance, mockLobbyChannelInstance, mockSendEvent, capturedEventHandlers } = vi.hoisted(() => {
  const mockChannelInstance = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockImplementation(function (this: unknown, cb: (status: string) => void) {
      cb("SUBSCRIBED");
      return mockChannelInstance;
    }),
    track: vi.fn().mockResolvedValue("ok"),
    presenceState: vi.fn().mockReturnValue({}),
    send: vi.fn().mockResolvedValue("ok"),
  };
  const mockLobbyChannelInstance = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    send: vi.fn().mockResolvedValue("ok"),
  };
  const mockSendEvent = vi.fn().mockResolvedValue(undefined);
  const capturedEventHandlers: Record<string, Function> = {};
  return { mockChannelInstance, mockLobbyChannelInstance, mockSendEvent, capturedEventHandlers };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: vi.fn().mockImplementation((name: string) => {
      if (name === "lobby:slot_updates") return mockLobbyChannelInstance;
      return mockChannelInstance;
    }),
    removeChannel: vi.fn(),
  }),
}));

vi.mock("@/lib/battle-room-channel", () => ({
  createBattleRoomChannel: vi
    .fn()
    .mockReturnValue(mockChannelInstance),
  LOBBY_SLOT_UPDATES_CHANNEL: "lobby:slot_updates",
}));

vi.mock("@/hooks/useBattleRoomPresence", () => ({
  useBattleRoomPresence: () => ({
    onlineUsers: [],
  }),
}));

vi.mock("@/hooks/useBattleRoomEvents", () => ({
  useBattleRoomEvents: (_channel: unknown, handlers: Record<string, Function>) => {
    Object.assign(capturedEventHandlers, handlers);
    return { sendEvent: mockSendEvent };
  },
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

  it("calls leaveRoom, broadcasts slot change, and navigates on leave", async () => {
    const user = userEvent.setup();
    const slots = createSlots();
    slots[1] = { slotIndex: 1, slotType: "player", userId: "user-2", botName: null };

    render(
      <RoomLobby
        room={createRoom()}
        slots={slots}
        userId="user-2"
        isHost={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /leave/i }));
    expect(mockLeaveRoom).toHaveBeenCalledWith("room-abc");
    expect(mockSendEvent).toHaveBeenCalledWith("slot_updated", {
      slotIndex: 1,
      slotType: "empty",
      userId: null,
      botName: null,
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard/battle");
  });

  it("broadcasts slot_updated after successful updateSlot", async () => {
    const user = userEvent.setup();
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );

    // Click a toggle button on an empty slot
    const toggleButtons = screen.getAllByRole("button", {
      name: /toggle slot/i,
    });
    await user.click(toggleButtons[0]);

    expect(mockUpdateSlot).toHaveBeenCalled();
    expect(mockSendEvent).toHaveBeenCalledWith(
      "slot_updated",
      expect.objectContaining({
        slotIndex: 0,
        slotType: "bot",
      })
    );
  });

  it("broadcasts slot_summary_updated on lobby channel after slot update", async () => {
    const user = userEvent.setup();
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );

    const toggleButtons = screen.getAllByRole("button", {
      name: /toggle slot/i,
    });
    await user.click(toggleButtons[0]);

    expect(mockLobbyChannelInstance.send).toHaveBeenCalledWith({
      type: "broadcast",
      event: "slot_summary_updated",
      payload: {
        publicId: "room-abc",
        slotSummary: expect.objectContaining({
          playerCount: expect.any(Number),
          botCount: expect.any(Number),
          openSlots: expect.any(Number),
        }),
      },
    });
  });

  it("broadcasts own slot on channel subscribe so other clients see the join", async () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );

    // Wait for the async subscribe callback (track → send) to complete
    await vi.waitFor(() => {
      expect(mockChannelInstance.send).toHaveBeenCalledWith({
        type: "broadcast",
        event: "slot_updated",
        payload: {
          slotIndex: 0,
          slotType: "player",
          userId: "host-1",
          botName: null,
        },
      });
    });
  });

  it("redirects kicked player to lobby when their slot is reassigned", () => {
    // Render as a non-host player in slot 1
    const slots = createSlots();
    slots[1] = { slotIndex: 1, slotType: "player", userId: "user-2", botName: null };

    render(
      <RoomLobby
        room={createRoom()}
        slots={slots}
        userId="user-2"
        isHost={false}
      />
    );

    // Simulate receiving a slot_updated event where user-2's slot is now empty (kicked)
    act(() => {
      capturedEventHandlers.onSlotUpdated({
        slotIndex: 1,
        slotType: "empty",
        userId: null,
        botName: null,
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard/battle");
  });

  it("does not redirect when another player's slot is updated", () => {
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );

    // Simulate a slot_updated event for a different slot
    act(() => {
      capturedEventHandlers.onSlotUpdated({
        slotIndex: 1,
        slotType: "bot",
        userId: null,
        botName: "SmartBot",
      });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("broadcasts game_starting and navigates on startGame", async () => {
    const user = userEvent.setup();
    render(
      <RoomLobby
        room={createRoom()}
        slots={createSlots()}
        userId="host-1"
        isHost={true}
      />
    );

    await user.click(screen.getByRole("button", { name: /start game/i }));
    expect(mockStartGame).toHaveBeenCalledWith("room-abc");
    expect(mockSendEvent).toHaveBeenCalledWith(
      "game_starting",
      expect.objectContaining({ startsAt: expect.any(String) })
    );
    expect(mockPush).toHaveBeenCalledWith("/dashboard/battle/room-abc/play");
  });
});
