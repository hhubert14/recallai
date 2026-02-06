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

// Mock auth provider
const mockUser = { id: "user-123", email: "test@test.com" };
vi.mock("./auth-provider", () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));

describe("StudySetListProvider", () => {
  let StudySetListProvider: React.FC<{ children: React.ReactNode }>;
  let useStudySetList: () => {
    studySets: Array<{
      id: number;
      publicId: string;
      userId: string;
      name: string;
      description: string | null;
      sourceType: "video" | "manual" | "pdf";
      createdAt: string;
      updatedAt: string;
      questionCount?: number;
      flashcardCount?: number;
    }>;
    setInitialStudySets: (
      studySets: Array<{
        id: number;
        publicId: string;
        userId: string;
        name: string;
        description: string | null;
        sourceType: "video" | "manual" | "pdf";
        createdAt: string;
        updatedAt: string;
        questionCount?: number;
        flashcardCount?: number;
      }>
    ) => void;
    isConnected: boolean;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset modules to get fresh imports
    vi.resetModules();

    // Reset the mock channel to default behavior
    mockChannel.on.mockReturnThis();
    mockChannel.subscribe.mockReturnValue(mockChannel);
    mockSupabase.channel.mockReturnValue(mockChannel);

    // Import fresh after mocks are set up
    const module = await import("./study-set-list-provider");
    StudySetListProvider = module.StudySetListProvider;
    useStudySetList = module.useStudySetList;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("setInitialStudySets", () => {
    it("sets initial study sets from server data", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      const initialStudySets = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "Test Study Set",
          description: "A test description",
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          questionCount: 5,
          flashcardCount: 10,
        },
      ];

      act(() => {
        result.current.setInitialStudySets(initialStudySets);
      });

      expect(result.current.studySets).toEqual(initialStudySets);
    });

    it("replaces existing study sets when called multiple times", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      const firstSet = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "First",
          description: null,
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      const secondSet = [
        {
          id: 2,
          publicId: "def-456",
          userId: "user-123",
          name: "Second",
          description: null,
          sourceType: "manual" as const,
          createdAt: "2025-01-02T00:00:00Z",
          updatedAt: "2025-01-02T00:00:00Z",
        },
      ];

      act(() => {
        result.current.setInitialStudySets(firstSet);
      });

      act(() => {
        result.current.setInitialStudySets(secondSet);
      });

      expect(result.current.studySets).toEqual(secondSet);
    });
  });

  describe("Realtime subscription", () => {
    it("subscribes to postgres_changes for study_sets table", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      renderHook(() => useStudySetList(), { wrapper });

      // Wait for useEffect to run
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith("study_sets_changes");
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "INSERT",
          schema: "public",
          table: "study_sets",
          filter: `user_id=eq.${mockUser.id}`,
        }),
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "UPDATE",
          schema: "public",
          table: "study_sets",
          filter: `user_id=eq.${mockUser.id}`,
        }),
        expect.any(Function)
      );
    });

    it("calls subscribe after setting up handlers", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      renderHook(() => useStudySetList(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });
    });
  });

  describe("INSERT event handling", () => {
    it("adds new study set to the beginning of the list", async () => {
      let insertCallback:
        | ((payload: { new: Record<string, unknown> }) => void)
        | null = null;

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
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      // Set initial study sets
      const initialStudySets = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "Existing",
          description: null,
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          questionCount: 5,
          flashcardCount: 10,
        },
      ];

      act(() => {
        result.current.setInitialStudySets(initialStudySets);
      });

      // Wait for subscription to be set up
      await waitFor(() => {
        expect(insertCallback).not.toBeNull();
      });

      // Simulate INSERT event with snake_case payload (as Supabase sends)
      act(() => {
        insertCallback!({
          new: {
            id: 2,
            public_id: "def-456",
            user_id: "user-123",
            name: "New Study Set",
            description: "New description",
            source_type: "manual",
            created_at: "2025-01-02T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      expect(result.current.studySets).toHaveLength(2);
      expect(result.current.studySets[0].id).toBe(2); // New one at beginning
      expect(result.current.studySets[0].publicId).toBe("def-456"); // Transformed to camelCase
      expect(result.current.studySets[0].sourceType).toBe("manual");
      expect(result.current.studySets[1].id).toBe(1); // Existing one after
    });

    it("prevents duplicate study sets on INSERT", async () => {
      let insertCallback:
        | ((payload: { new: Record<string, unknown> }) => void)
        | null = null;

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
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      const initialStudySets = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "Existing",
          description: null,
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      act(() => {
        result.current.setInitialStudySets(initialStudySets);
      });

      await waitFor(() => {
        expect(insertCallback).not.toBeNull();
      });

      // Simulate INSERT event for already existing study set
      act(() => {
        insertCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            user_id: "user-123",
            name: "Updated Name",
            description: null,
            source_type: "video",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        });
      });

      // Should still have only 1 study set
      expect(result.current.studySets).toHaveLength(1);
    });
  });

  describe("UPDATE event handling", () => {
    it("updates existing study set in place", async () => {
      let updateCallback:
        | ((payload: { new: Record<string, unknown> }) => void)
        | null = null;

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
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      const initialStudySets = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "Original Name",
          description: null,
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          questionCount: 5,
          flashcardCount: 10,
        },
        {
          id: 2,
          publicId: "def-456",
          userId: "user-123",
          name: "Other Set",
          description: null,
          sourceType: "manual" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          questionCount: 3,
          flashcardCount: 7,
        },
      ];

      act(() => {
        result.current.setInitialStudySets(initialStudySets);
      });

      await waitFor(() => {
        expect(updateCallback).not.toBeNull();
      });

      // Simulate UPDATE event
      act(() => {
        updateCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            user_id: "user-123",
            name: "Updated Name",
            description: "New description",
            source_type: "video",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      expect(result.current.studySets).toHaveLength(2);
      expect(result.current.studySets[0].name).toBe("Updated Name");
      expect(result.current.studySets[0].description).toBe("New description");
      // Other set should be unchanged
      expect(result.current.studySets[1].name).toBe("Other Set");
    });

    it("preserves questionCount and flashcardCount on UPDATE", async () => {
      let updateCallback:
        | ((payload: { new: Record<string, unknown> }) => void)
        | null = null;

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
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      const initialStudySets = [
        {
          id: 1,
          publicId: "abc-123",
          userId: "user-123",
          name: "Original Name",
          description: null,
          sourceType: "video" as const,
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
          questionCount: 5,
          flashcardCount: 10,
        },
      ];

      act(() => {
        result.current.setInitialStudySets(initialStudySets);
      });

      await waitFor(() => {
        expect(updateCallback).not.toBeNull();
      });

      // Simulate UPDATE event (realtime payload doesn't include counts)
      act(() => {
        updateCallback!({
          new: {
            id: 1,
            public_id: "abc-123",
            user_id: "user-123",
            name: "Updated Name",
            description: null,
            source_type: "video",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        });
      });

      // Counts should be preserved from initial data
      expect(result.current.studySets[0].questionCount).toBe(5);
      expect(result.current.studySets[0].flashcardCount).toBe(10);
    });
  });

  describe("Cleanup", () => {
    it("calls removeChannel on unmount", async () => {
      // Create a specific channel instance for this test to track
      const testChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel.mockReturnValue(testChannel);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      const { unmount } = renderHook(() => useStudySetList(), { wrapper });

      await waitFor(() => {
        expect(testChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(testChannel);
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

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      // Initially not connected
      expect(result.current.isConnected).toBe(false);

      await waitFor(() => {
        expect(subscribeCallback).not.toBeNull();
      });

      // Simulate SUBSCRIBED status
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

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(StudySetListProvider, null, children);

      const { result } = renderHook(() => useStudySetList(), { wrapper });

      await waitFor(() => {
        expect(subscribeCallback).not.toBeNull();
      });

      // First connect
      act(() => {
        subscribeCallback!("SUBSCRIBED");
      });

      expect(result.current.isConnected).toBe(true);

      // Then error
      act(() => {
        subscribeCallback!("CHANNEL_ERROR");
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("useStudySetList hook", () => {
    it("throws error when used outside provider", async () => {
      // We need to test that using the hook outside the provider throws
      // We'll do this by rendering without the wrapper
      expect(() => {
        renderHook(() => useStudySetList());
      }).toThrow("useStudySetList must be used within a StudySetListProvider");
    });
  });
});
