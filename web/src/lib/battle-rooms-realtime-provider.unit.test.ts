import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
};

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

vi.mock("./supabase/client", () => ({
  createClient: () => mockSupabase,
}));

describe("BattleRoomsRealtimeProvider", () => {
  let BattleRoomsRealtimeProvider: React.FC<{ children: React.ReactNode }>;
  let useBattleRoomsList: () => {
    rooms: Array<{
      publicId: string;
      name: string;
      visibility: "public" | "private";
      timeLimitSeconds: number;
      questionCount: number;
      studySetName: string;
      createdAt: string;
      slotSummary: {
        playerCount: number;
        botCount: number;
        openSlots: number;
      };
    }>;
    setInitialRooms: (
      rooms: Array<{
        publicId: string;
        name: string;
        visibility: "public" | "private";
        timeLimitSeconds: number;
        questionCount: number;
        studySetName: string;
        createdAt: string;
        slotSummary: {
          playerCount: number;
          botCount: number;
          openSlots: number;
        };
      }>
    ) => void;
    isConnected: boolean;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockChannel.on.mockReturnThis();
    mockChannel.subscribe.mockReturnValue(mockChannel);
    mockSupabase.channel.mockReturnValue(mockChannel);

    const module = await import("./battle-rooms-realtime-provider");
    BattleRoomsRealtimeProvider = module.BattleRoomsRealtimeProvider;
    useBattleRoomsList = module.useBattleRoomsList;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("setInitialRooms", () => {
    it("sets initial rooms from server data", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Test Room",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      expect(result.current.rooms).toEqual(initialRooms);
    });

    it("replaces existing rooms when called multiple times", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const firstSet = [
        {
          publicId: "abc-123",
          name: "First",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "Set A",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
      ];

      const secondSet = [
        {
          publicId: "def-456",
          name: "Second",
          visibility: "private" as const,
          timeLimitSeconds: 60,
          questionCount: 5,
          studySetName: "Set B",
          createdAt: "2025-01-02T00:00:00Z",
          slotSummary: { playerCount: 2, botCount: 1, openSlots: 1 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(firstSet);
      });

      act(() => {
        result.current.setInitialRooms(secondSet);
      });

      expect(result.current.rooms).toEqual(secondSet);
    });
  });

  describe("Realtime subscription", () => {
    it("subscribes to postgres_changes for battle_rooms table", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      renderHook(() => useBattleRoomsList(), { wrapper });

      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith(
          "battle_rooms_changes"
        );
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "INSERT",
          schema: "public",
          table: "battle_rooms",
        }),
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "UPDATE",
          schema: "public",
          table: "battle_rooms",
        }),
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "DELETE",
          schema: "public",
          table: "battle_rooms",
        }),
        expect.any(Function)
      );
    });

    it("calls subscribe after setting up handlers", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      renderHook(() => useBattleRoomsList(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });
    });
  });

  describe("INSERT event handling", () => {
    it("adds new room to the beginning of the list with default slotSummary", async () => {
      let insertCallback: ((payload: { new: Record<string, unknown> }) => void) | null =
        null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { new: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "INSERT") {
            insertCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Existing",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 2, botCount: 0, openSlots: 2 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(insertCallback).not.toBeNull();
      });

      act(() => {
        insertCallback!({
          new: {
            id: 2,
            public_id: "def-456",
            host_user_id: "user-789",
            study_set_id: 1,
            name: "New Room",
            visibility: "public",
            status: "waiting",
            time_limit_seconds: 60,
            question_count: 5,
            created_at: "2025-01-02T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(2);
      expect(result.current.rooms[0].publicId).toBe("def-456");
      expect(result.current.rooms[0].name).toBe("New Room");
      expect(result.current.rooms[0].timeLimitSeconds).toBe(60);
      expect(result.current.rooms[0].questionCount).toBe(5);
      // Default slot summary for new room
      expect(result.current.rooms[0].slotSummary).toEqual({
        playerCount: 1,
        botCount: 0,
        openSlots: 0,
      });
      // Study set name unknown from realtime payload
      expect(result.current.rooms[0].studySetName).toBe("Unknown");
      expect(result.current.rooms[1].publicId).toBe("abc-123");
    });

    it("prevents duplicate rooms on INSERT", async () => {
      let insertCallback: ((payload: { new: Record<string, unknown> }) => void) | null =
        null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { new: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "INSERT") {
            insertCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Existing",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(insertCallback).not.toBeNull();
      });

      act(() => {
        insertCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            host_user_id: "user-123",
            study_set_id: 1,
            name: "Duplicate",
            visibility: "public",
            status: "waiting",
            time_limit_seconds: 30,
            question_count: 10,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(1);
    });

    it("does not add rooms with non-waiting status", async () => {
      let insertCallback: ((payload: { new: Record<string, unknown> }) => void) | null =
        null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { new: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "INSERT") {
            insertCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      act(() => {
        result.current.setInitialRooms([]);
      });

      await waitFor(() => {
        expect(insertCallback).not.toBeNull();
      });

      act(() => {
        insertCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            host_user_id: "user-123",
            study_set_id: 1,
            name: "In Game Room",
            visibility: "public",
            status: "in_game",
            time_limit_seconds: 30,
            question_count: 10,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(0);
    });
  });

  describe("UPDATE event handling", () => {
    it("updates existing room in place", async () => {
      let updateCallback: ((payload: { new: Record<string, unknown> }) => void) | null =
        null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { new: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "UPDATE") {
            updateCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Original",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
        {
          publicId: "def-456",
          name: "Other Room",
          visibility: "public" as const,
          timeLimitSeconds: 60,
          questionCount: 5,
          studySetName: "Other Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 2, botCount: 0, openSlots: 2 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(updateCallback).not.toBeNull();
      });

      act(() => {
        updateCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            host_user_id: "user-123",
            study_set_id: 1,
            name: "Updated Room",
            visibility: "private",
            status: "waiting",
            time_limit_seconds: 30,
            question_count: 10,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(2);
      expect(result.current.rooms[0].name).toBe("Updated Room");
      expect(result.current.rooms[0].visibility).toBe("private");
      // Preserves slotSummary and studySetName
      expect(result.current.rooms[0].slotSummary).toEqual({
        playerCount: 1,
        botCount: 0,
        openSlots: 3,
      });
      expect(result.current.rooms[0].studySetName).toBe("My Set");
      // Other room unchanged
      expect(result.current.rooms[1].name).toBe("Other Room");
    });

    it("removes room from list if status changes away from waiting", async () => {
      let updateCallback: ((payload: { new: Record<string, unknown> }) => void) | null =
        null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { new: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "UPDATE") {
            updateCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Room",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 2, botCount: 0, openSlots: 2 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(updateCallback).not.toBeNull();
      });

      act(() => {
        updateCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            host_user_id: "user-123",
            study_set_id: 1,
            name: "Room",
            visibility: "public",
            status: "in_game",
            time_limit_seconds: 30,
            question_count: 10,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(0);
    });
  });

  describe("DELETE event handling", () => {
    it("removes room from list on DELETE", async () => {
      let deleteCallback:
        | ((payload: { old: Record<string, unknown> }) => void)
        | null = null;

      mockChannel.on.mockImplementation(
        (
          _event: string,
          filter: { event: string },
          callback: (payload: { old: Record<string, unknown> }) => void
        ) => {
          if (filter.event === "DELETE") {
            deleteCallback = callback;
          }
          return mockChannel;
        }
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Room 1",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "Set A",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
        {
          publicId: "def-456",
          name: "Room 2",
          visibility: "public" as const,
          timeLimitSeconds: 60,
          questionCount: 5,
          studySetName: "Set B",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 2, botCount: 0, openSlots: 2 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(deleteCallback).not.toBeNull();
      });

      act(() => {
        deleteCallback!({
          old: {
            id: 1,
            public_id: "abc-123",
          },
        });
      });

      expect(result.current.rooms).toHaveLength(1);
      expect(result.current.rooms[0].publicId).toBe("def-456");
    });
  });

  describe("Cleanup", () => {
    it("calls removeChannel on unmount for both channels", async () => {
      const testChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };
      const testLobbyChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel
        .mockReturnValueOnce(testChannel)
        .mockReturnValueOnce(testLobbyChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { unmount } = renderHook(() => useBattleRoomsList(), { wrapper });

      await waitFor(() => {
        expect(testChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(testChannel);
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(testLobbyChannel);
    });
  });

  describe("Connection status", () => {
    it("sets isConnected to true on SUBSCRIBED status", async () => {
      let subscribeCallback: ((status: string) => void) | null = null;

      mockChannel.subscribe.mockImplementation(
        (callback: (status: string) => void) => {
          subscribeCallback = callback;
          return mockChannel;
        }
      );

      const lobbyChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };

      mockSupabase.channel
        .mockReturnValueOnce(mockChannel)
        .mockReturnValueOnce(lobbyChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      expect(result.current.isConnected).toBe(false);

      await waitFor(() => {
        expect(subscribeCallback).not.toBeNull();
      });

      act(() => {
        subscribeCallback!("SUBSCRIBED");
      });

      expect(result.current.isConnected).toBe(true);
    });

    it("sets isConnected to false on error status", async () => {
      let subscribeCallback: ((status: string) => void) | null = null;

      mockChannel.subscribe.mockImplementation(
        (callback: (status: string) => void) => {
          subscribeCallback = callback;
          return mockChannel;
        }
      );

      const lobbyChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };

      mockSupabase.channel
        .mockReturnValueOnce(mockChannel)
        .mockReturnValueOnce(lobbyChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      await waitFor(() => {
        expect(subscribeCallback).not.toBeNull();
      });

      act(() => {
        subscribeCallback!("SUBSCRIBED");
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        subscribeCallback!("CHANNEL_ERROR");
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Lobby slot summary broadcast", () => {
    it("updates room slotSummary on lobby broadcast", async () => {
      let broadcastCallback:
        | ((payload: { payload: Record<string, unknown> }) => void)
        | null = null;

      const lobbyChannel = {
        on: vi.fn().mockImplementation(
          (
            _type: string,
            _filter: { event: string },
            callback: (payload: { payload: Record<string, unknown> }) => void
          ) => {
            broadcastCallback = callback;
            return lobbyChannel;
          }
        ),
        subscribe: vi.fn().mockReturnThis(),
      };

      // First call returns the postgres_changes channel, second returns lobby channel
      mockSupabase.channel
        .mockReturnValueOnce(mockChannel)
        .mockReturnValueOnce(lobbyChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Room 1",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(broadcastCallback).not.toBeNull();
      });

      act(() => {
        broadcastCallback!({
          payload: {
            publicId: "abc-123",
            slotSummary: { playerCount: 2, botCount: 1, openSlots: 1 },
          },
        });
      });

      expect(result.current.rooms[0].slotSummary).toEqual({
        playerCount: 2,
        botCount: 1,
        openSlots: 1,
      });
    });

    it("ignores lobby broadcast for unknown room", async () => {
      let broadcastCallback:
        | ((payload: { payload: Record<string, unknown> }) => void)
        | null = null;

      const lobbyChannel = {
        on: vi.fn().mockImplementation(
          (
            _type: string,
            _filter: { event: string },
            callback: (payload: { payload: Record<string, unknown> }) => void
          ) => {
            broadcastCallback = callback;
            return lobbyChannel;
          }
        ),
        subscribe: vi.fn().mockReturnThis(),
      };

      mockSupabase.channel
        .mockReturnValueOnce(mockChannel)
        .mockReturnValueOnce(lobbyChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(BattleRoomsRealtimeProvider, null, children);

      const { result } = renderHook(() => useBattleRoomsList(), { wrapper });

      const initialRooms = [
        {
          publicId: "abc-123",
          name: "Room 1",
          visibility: "public" as const,
          timeLimitSeconds: 30,
          questionCount: 10,
          studySetName: "My Set",
          createdAt: "2025-01-01T00:00:00Z",
          slotSummary: { playerCount: 1, botCount: 0, openSlots: 3 },
        },
      ];

      act(() => {
        result.current.setInitialRooms(initialRooms);
      });

      await waitFor(() => {
        expect(broadcastCallback).not.toBeNull();
      });

      act(() => {
        broadcastCallback!({
          payload: {
            publicId: "unknown-room",
            slotSummary: { playerCount: 3, botCount: 0, openSlots: 1 },
          },
        });
      });

      // Room unchanged
      expect(result.current.rooms).toHaveLength(1);
      expect(result.current.rooms[0].slotSummary).toEqual({
        playerCount: 1,
        botCount: 0,
        openSlots: 3,
      });
    });
  });

  describe("useBattleRoomsList hook", () => {
    it("throws error when used outside provider", async () => {
      expect(() => {
        renderHook(() => useBattleRoomsList());
      }).toThrow(
        "useBattleRoomsList must be used within a BattleRoomsRealtimeProvider"
      );
    });
  });
});
