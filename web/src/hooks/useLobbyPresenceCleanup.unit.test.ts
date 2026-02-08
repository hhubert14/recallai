import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useLobbyPresenceCleanup,
  GRACE_PERIOD_MS,
} from "./useLobbyPresenceCleanup";
import type { BattleRoomPresenceState } from "@/lib/battle-room-channel";
import type { BattleSlot } from "@/app/dashboard/battle/_components/types";

function makePresence(userId: string): BattleRoomPresenceState {
  return { userId, onlineAt: new Date().toISOString() };
}

function makeSlot(
  slotIndex: number,
  userId: string | null,
  slotType: BattleSlot["slotType"] = "player"
): BattleSlot {
  return { slotIndex, slotType, userId, botName: null };
}

describe("useLobbyPresenceCleanup", () => {
  const hostUserId = "host-user";
  const playerA = "player-a";
  const playerB = "player-b";
  const publicId = "room-123";

  let kickPlayer: ReturnType<typeof vi.fn>;
  let closeRoom: ReturnType<typeof vi.fn>;
  let onPlayerKicked: ReturnType<typeof vi.fn>;
  let onRoomClosed: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    kickPlayer = vi.fn().mockResolvedValue({
      slotIndex: 1,
      slotType: "empty",
      userId: null,
      botName: null,
    });
    closeRoom = vi.fn().mockResolvedValue(true);
    onPlayerKicked = vi.fn();
    onRoomClosed = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderCleanupHook(overrides: Record<string, unknown> = {}) {
    const defaultProps = {
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    };

    return renderHook(
      (props) => useLobbyPresenceCleanup(props),
      { initialProps: { ...defaultProps, ...overrides } }
    );
  }

  it("does nothing when no users leave", () => {
    const onlineUsers = [makePresence(hostUserId), makePresence(playerA)];
    const { rerender } = renderCleanupHook({ onlineUsers });

    // Rerender with same users
    rerender({
      onlineUsers,
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 1000);

    expect(kickPlayer).not.toHaveBeenCalled();
    expect(closeRoom).not.toHaveBeenCalled();
  });

  it("host kicks disconnected non-host after grace period", () => {
    const { rerender } = renderCleanupHook({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
    });

    // playerA disconnects
    rerender({
      onlineUsers: [makePresence(hostUserId)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    // Before grace period
    vi.advanceTimersByTime(GRACE_PERIOD_MS - 100);
    expect(kickPlayer).not.toHaveBeenCalled();

    // After grace period
    vi.advanceTimersByTime(200);
    expect(kickPlayer).toHaveBeenCalledWith(publicId, 1);
  });

  it("cancels kick timer if non-host reconnects within grace period", () => {
    const { rerender } = renderCleanupHook({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
    });

    // playerA disconnects
    rerender({
      onlineUsers: [makePresence(hostUserId)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(2000);

    // playerA reconnects
    rerender({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 1000);
    expect(kickPlayer).not.toHaveBeenCalled();
  });

  it("non-host does not kick other players when they disconnect", () => {
    const { rerender } = renderCleanupHook({
      userId: playerA,
      isHost: false,
      onlineUsers: [makePresence(hostUserId), makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
    });

    // playerB disconnects
    rerender({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: playerA,
      isHost: false,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 1000);
    expect(kickPlayer).not.toHaveBeenCalled();
  });

  it("designated closer calls closeRoom when host disconnects", () => {
    // playerA is at slot 1 (lowest non-host), so it's the designated closer
    const { rerender } = renderCleanupHook({
      userId: playerA,
      isHost: false,
      onlineUsers: [makePresence(hostUserId), makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
    });

    // Host disconnects
    rerender({
      onlineUsers: [makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: playerA,
      isHost: false,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 100);
    expect(closeRoom).toHaveBeenCalledWith(publicId);
  });

  it("non-designated player only calls onRoomClosed when host disconnects", () => {
    // playerB is at slot 2, playerA at slot 1 is the designated closer
    const { rerender } = renderCleanupHook({
      userId: playerB,
      isHost: false,
      onlineUsers: [makePresence(hostUserId), makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
    });

    // Host disconnects
    rerender({
      onlineUsers: [makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: playerB,
      isHost: false,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 100);
    expect(closeRoom).not.toHaveBeenCalled();
    expect(onRoomClosed).toHaveBeenCalled();
  });

  it("cancels host disconnect timer if host reconnects within grace period", () => {
    const { rerender } = renderCleanupHook({
      userId: playerA,
      isHost: false,
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
    });

    // Host disconnects
    rerender({
      onlineUsers: [makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: playerA,
      isHost: false,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(2000);

    // Host reconnects
    rerender({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: playerA,
      isHost: false,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 1000);
    expect(closeRoom).not.toHaveBeenCalled();
    expect(onRoomClosed).not.toHaveBeenCalled();
  });

  it("clears all pending timeouts on unmount", () => {
    const { rerender, unmount } = renderCleanupHook({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
    });

    // playerA disconnects
    rerender({
      onlineUsers: [makePresence(hostUserId)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    unmount();

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 1000);
    expect(kickPlayer).not.toHaveBeenCalled();
  });

  it("handles multiple independent disconnect timers", () => {
    const { rerender } = renderCleanupHook({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA), makePresence(playerB)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
    });

    // Both playerA and playerB disconnect
    rerender({
      onlineUsers: [makePresence(hostUserId)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, playerB),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 100);
    expect(kickPlayer).toHaveBeenCalledTimes(2);
    expect(kickPlayer).toHaveBeenCalledWith(publicId, 1);
    expect(kickPlayer).toHaveBeenCalledWith(publicId, 2);
  });

  it("calls onPlayerKicked callback after successful kick", async () => {
    const { rerender } = renderCleanupHook({
      onlineUsers: [makePresence(hostUserId), makePresence(playerA)],
    });

    // playerA disconnects
    rerender({
      onlineUsers: [makePresence(hostUserId)],
      slots: [
        makeSlot(0, hostUserId),
        makeSlot(1, playerA),
        makeSlot(2, null, "empty"),
        makeSlot(3, null, "bot"),
      ],
      hostUserId,
      userId: hostUserId,
      isHost: true,
      publicId,
      kickPlayer,
      closeRoom,
      onPlayerKicked,
      onRoomClosed,
    });

    vi.advanceTimersByTime(GRACE_PERIOD_MS + 100);

    // Allow the async kickPlayer promise to resolve
    await vi.advanceTimersByTimeAsync(0);

    expect(onPlayerKicked).toHaveBeenCalledWith(1);
  });
});
