import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleRoomEvents } from "./useBattleRoomEvents";
import type {
  SlotUpdatedEvent,
  GameStartingEvent,
} from "@/lib/battle-room-channel";

describe("useBattleRoomEvents", () => {
  let mockChannel: {
    on: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      send: vi.fn().mockResolvedValue("ok"),
    };
  });

  it("returns sendEvent function when channel is provided", () => {
    const { result } = renderHook(() =>
      useBattleRoomEvents(mockChannel as never, {})
    );

    expect(result.current.sendEvent).toBeInstanceOf(Function);
  });

  it("registers broadcast listeners for provided handlers", () => {
    const onSlotUpdated = vi.fn();
    const onGameStarting = vi.fn();

    renderHook(() =>
      useBattleRoomEvents(mockChannel as never, {
        onSlotUpdated,
        onGameStarting,
      })
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "slot_updated" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "game_starting" },
      expect.any(Function)
    );
  });

  it("calls handler with payload.payload on broadcast event", () => {
    const onSlotUpdated = vi.fn();

    let broadcastCallback:
      | ((payload: { payload: SlotUpdatedEvent }) => void)
      | null = null;

    mockChannel.on.mockImplementation(
      (
        _type: string,
        filter: { event: string },
        callback: (payload: { payload: SlotUpdatedEvent }) => void
      ) => {
        if (filter.event === "slot_updated") {
          broadcastCallback = callback;
        }
        return mockChannel;
      }
    );

    renderHook(() =>
      useBattleRoomEvents(mockChannel as never, { onSlotUpdated })
    );

    expect(broadcastCallback).not.toBeNull();

    const slotEvent: SlotUpdatedEvent = {
      slotIndex: 0,
      slotType: "bot",
      userId: null,
      botName: "SmartBot",
    };

    act(() => {
      broadcastCallback!({ payload: slotEvent });
    });

    expect(onSlotUpdated).toHaveBeenCalledWith(slotEvent);
  });

  it("sendEvent broadcasts event through channel", async () => {
    const { result } = renderHook(() =>
      useBattleRoomEvents(mockChannel as never, {})
    );

    const slotEvent: SlotUpdatedEvent = {
      slotIndex: 1,
      slotType: "empty",
      userId: null,
      botName: null,
    };

    await act(async () => {
      await result.current.sendEvent("slot_updated", slotEvent);
    });

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: "broadcast",
      event: "slot_updated",
      payload: slotEvent,
    });
  });

  it("sendEvent is a no-op when channel is null", async () => {
    const { result } = renderHook(() =>
      useBattleRoomEvents(null, {})
    );

    // Should not throw
    await act(async () => {
      await result.current.sendEvent("slot_updated", {
        slotIndex: 0,
        slotType: "empty",
        userId: null,
        botName: null,
      });
    });
  });

  it("does not re-register listeners when handler reference changes", () => {
    const onSlotUpdated1 = vi.fn();
    const onSlotUpdated2 = vi.fn();

    const { rerender } = renderHook(
      ({ handlers }) => useBattleRoomEvents(mockChannel as never, handlers),
      {
        initialProps: {
          handlers: { onSlotUpdated: onSlotUpdated1 },
        },
      }
    );

    const initialCallCount = mockChannel.on.mock.calls.length;

    rerender({ handlers: { onSlotUpdated: onSlotUpdated2 } });

    // Should not have added new listeners
    expect(mockChannel.on).toHaveBeenCalledTimes(initialCallCount);
  });

  it("uses latest handler via ref even after re-render", () => {
    const onSlotUpdated1 = vi.fn();
    const onSlotUpdated2 = vi.fn();

    let broadcastCallback:
      | ((payload: { payload: SlotUpdatedEvent }) => void)
      | null = null;

    mockChannel.on.mockImplementation(
      (
        _type: string,
        filter: { event: string },
        callback: (payload: { payload: SlotUpdatedEvent }) => void
      ) => {
        if (filter.event === "slot_updated") {
          broadcastCallback = callback;
        }
        return mockChannel;
      }
    );

    const { rerender } = renderHook(
      ({ handlers }) => useBattleRoomEvents(mockChannel as never, handlers),
      {
        initialProps: {
          handlers: { onSlotUpdated: onSlotUpdated1 },
        },
      }
    );

    // Update handler
    rerender({ handlers: { onSlotUpdated: onSlotUpdated2 } });

    const slotEvent: SlotUpdatedEvent = {
      slotIndex: 0,
      slotType: "bot",
      userId: null,
      botName: "Bot",
    };

    act(() => {
      broadcastCallback!({ payload: slotEvent });
    });

    // Should call the latest handler
    expect(onSlotUpdated1).not.toHaveBeenCalled();
    expect(onSlotUpdated2).toHaveBeenCalledWith(slotEvent);
  });

  it("registers listeners for all event types when all handlers provided", () => {
    renderHook(() =>
      useBattleRoomEvents(mockChannel as never, {
        onSlotUpdated: vi.fn(),
        onGameStarting: vi.fn(),
        onQuestionStart: vi.fn(),
        onAnswerSubmitted: vi.fn(),
        onQuestionReveal: vi.fn(),
        onGameFinished: vi.fn(),
      })
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "slot_updated" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "game_starting" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "question_start" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "answer_submitted" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "question_reveal" },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "game_finished" },
      expect.any(Function)
    );
  });
});
