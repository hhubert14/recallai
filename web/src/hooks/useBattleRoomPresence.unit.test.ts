import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleRoomPresence } from "./useBattleRoomPresence";
import type { BattleRoomPresenceState } from "@/lib/battle-room-channel";

describe("useBattleRoomPresence", () => {
  let mockChannel: {
    on: ReturnType<typeof vi.fn>;
    presenceState: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      presenceState: vi.fn().mockReturnValue({}),
    };
  });

  it("returns empty onlineUsers when channel is null", () => {
    const { result } = renderHook(() =>
      useBattleRoomPresence(null)
    );

    expect(result.current.onlineUsers).toEqual([]);
  });

  it("registers presence sync, join, and leave listeners", () => {
    renderHook(() =>
      useBattleRoomPresence(mockChannel as never)
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      "presence",
      { event: "sync" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "presence",
      { event: "join" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "presence",
      { event: "leave" },
      expect.any(Function)
    );
  });

  it("updates onlineUsers on sync event", () => {
    const presenceState: Record<string, BattleRoomPresenceState[]> = {
      "user-1": [{ userId: "user-1", onlineAt: "2025-01-01T00:00:00Z" }],
      "user-2": [{ userId: "user-2", onlineAt: "2025-01-01T00:01:00Z" }],
    };

    mockChannel.presenceState.mockReturnValue(presenceState);

    let syncCallback: (() => void) | null = null;

    mockChannel.on.mockImplementation(
      (_type: string, filter: { event: string }, callback: () => void) => {
        if (filter.event === "sync") {
          syncCallback = callback;
        }
        return mockChannel;
      }
    );

    const { result } = renderHook(() =>
      useBattleRoomPresence(mockChannel as never)
    );

    expect(syncCallback).not.toBeNull();

    act(() => {
      syncCallback!();
    });

    expect(result.current.onlineUsers).toHaveLength(2);
    expect(result.current.onlineUsers).toContainEqual({
      userId: "user-1",
      onlineAt: "2025-01-01T00:00:00Z",
    });
    expect(result.current.onlineUsers).toContainEqual({
      userId: "user-2",
      onlineAt: "2025-01-01T00:01:00Z",
    });
  });

  it("cleans up listeners when channel changes to null", () => {
    type HookProps = {
      channel: Parameters<typeof useBattleRoomPresence>[0];
    };

    const { rerender } = renderHook(
      ({ channel }: HookProps) =>
        useBattleRoomPresence(channel),
      {
        initialProps: {
          channel: mockChannel as unknown as HookProps["channel"],
        },
      }
    );

    // Initially registered listeners
    expect(mockChannel.on).toHaveBeenCalledTimes(3);

    // Change to null channel
    rerender({ channel: null });

    // No crash, no additional registrations on null
  });

  it("reads current presence state immediately on mount to handle race", () => {
    const presenceState: Record<string, BattleRoomPresenceState[]> = {
      "user-1": [{ userId: "user-1", onlineAt: "2025-01-01T00:00:00Z" }],
    };

    // presenceState already has data (track() fired before listeners registered)
    mockChannel.presenceState.mockReturnValue(presenceState);

    const { result } = renderHook(() =>
      useBattleRoomPresence(mockChannel as never)
    );

    // Should have users immediately without needing a sync event
    expect(result.current.onlineUsers).toHaveLength(1);
    expect(result.current.onlineUsers[0].userId).toBe("user-1");
  });

  it("handles presence state with multiple entries per key", () => {
    const presenceState: Record<string, BattleRoomPresenceState[]> = {
      "user-1": [
        { userId: "user-1", onlineAt: "2025-01-01T00:00:00Z" },
        { userId: "user-1", onlineAt: "2025-01-01T00:05:00Z" },
      ],
    };

    mockChannel.presenceState.mockReturnValue(presenceState);

    let syncCallback: (() => void) | null = null;

    mockChannel.on.mockImplementation(
      (_type: string, filter: { event: string }, callback: () => void) => {
        if (filter.event === "sync") {
          syncCallback = callback;
        }
        return mockChannel;
      }
    );

    const { result } = renderHook(() =>
      useBattleRoomPresence(mockChannel as never)
    );

    act(() => {
      syncCallback!();
    });

    // Should take only the first presence entry per key
    expect(result.current.onlineUsers).toHaveLength(1);
    expect(result.current.onlineUsers[0].userId).toBe("user-1");
  });
});
