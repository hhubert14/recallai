import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleLobby } from "./useBattleLobby";

describe("useBattleLobby", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createRoom", () => {
    it("posts to /api/v1/battle/rooms and returns publicId on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              room: { publicId: "abc-123" },
              slots: [],
            },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let publicId: string | undefined;
      await act(async () => {
        publicId = await result.current.createRoom({
          studySetPublicId: "set-1",
          name: "My Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(publicId).toBe("abc-123");
      expect(global.fetch).toHaveBeenCalledWith("/api/v1/battle/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetPublicId: "set-1",
          name: "My Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        }),
      });
    });

    it("includes password for private rooms", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: { room: { publicId: "abc-123" }, slots: [] },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      await act(async () => {
        await result.current.createRoom({
          studySetPublicId: "set-1",
          name: "Private Room",
          visibility: "private",
          password: "secret",
          timeLimitSeconds: 20,
          questionCount: 5,
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms",
        expect.objectContaining({
          body: expect.stringContaining('"password":"secret"'),
        })
      );
    });

    it("returns undefined and sets error on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Study set not found" },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let publicId: string | undefined;
      await act(async () => {
        publicId = await result.current.createRoom({
          studySetPublicId: "bad-id",
          name: "Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(publicId).toBeUndefined();
      expect(result.current.error).toBe("Study set not found");
    });

    it("sets isLoading during request", async () => {
      let resolveRequest: (value: unknown) => void;
      global.fetch = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );

      const { result } = renderHook(() => useBattleLobby());

      expect(result.current.isLoading).toBe(false);

      let promise: Promise<unknown>;
      act(() => {
        promise = result.current.createRoom({
          studySetPublicId: "set-1",
          name: "Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveRequest!({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "success",
              data: { room: { publicId: "abc" }, slots: [] },
            }),
        });
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("joinRoom", () => {
    it("posts to join endpoint and returns slot on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              slot: { slotIndex: 1, slotType: "player", userId: "u1", botName: null },
            },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.joinRoom("room-abc");
      });

      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
    });

    it("includes password when provided", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              slot: { slotIndex: 2, slotType: "player", userId: "u1", botName: null },
            },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      await act(async () => {
        await result.current.joinRoom("room-abc", "secret123");
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/join",
        expect.objectContaining({
          body: JSON.stringify({ password: "secret123" }),
        })
      );
    });

    it("returns false and sets error on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Incorrect password" },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.joinRoom("room-abc", "wrong");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Incorrect password");
    });
  });

  describe("leaveRoom", () => {
    it("posts to leave endpoint and returns true on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ status: "success", data: {} }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.leaveRoom("room-abc");
      });

      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/leave",
        { method: "POST" }
      );
    });
  });

  describe("updateSlot", () => {
    it("patches slot with update action", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              slot: { slotIndex: 2, slotType: "bot", userId: null, botName: "Skynet" },
            },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let slot: unknown;
      await act(async () => {
        slot = await result.current.updateSlot("room-abc", 2, "bot");
      });

      expect(slot).toEqual({
        slotIndex: 2,
        slotType: "bot",
        userId: null,
        botName: "Skynet",
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/slots/2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", slotType: "bot" }),
        }
      );
    });
  });

  describe("kickPlayer", () => {
    it("patches slot with kick action", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              slot: { slotIndex: 1, slotType: "empty", userId: null, botName: null },
            },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let slot: unknown;
      await act(async () => {
        slot = await result.current.kickPlayer("room-abc", 1);
      });

      expect(slot).toEqual({
        slotIndex: 1,
        slotType: "empty",
        userId: null,
        botName: null,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/slots/1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "kick" }),
        }
      );
    });
  });

  describe("startGame", () => {
    it("posts to start endpoint and returns true on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: { room: { publicId: "room-abc", status: "in_game" } },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.startGame("room-abc");
      });

      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/battle/rooms/room-abc/start",
        { method: "POST" }
      );
    });

    it("returns false and sets error on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            status: "fail",
            data: { error: "Not enough questions available" },
          }),
      });

      const { result } = renderHook(() => useBattleLobby());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.startGame("room-abc");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Not enough questions available");
    });
  });

  describe("error clearing", () => {
    it("clears error when a new action starts", async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          json: () =>
            Promise.resolve({
              status: "fail",
              data: { error: "First error" },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "success",
              data: { room: { publicId: "abc" }, slots: [] },
            }),
        });

      const { result } = renderHook(() => useBattleLobby());

      await act(async () => {
        await result.current.createRoom({
          studySetPublicId: "set-1",
          name: "Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(result.current.error).toBe("First error");

      await act(async () => {
        await result.current.createRoom({
          studySetPublicId: "set-1",
          name: "Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("network error handling", () => {
    it("sets generic error when fetch throws", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useBattleLobby());

      await act(async () => {
        await result.current.createRoom({
          studySetPublicId: "set-1",
          name: "Room",
          visibility: "public",
          timeLimitSeconds: 15,
          questionCount: 10,
        });
      });

      expect(result.current.error).toBe("An error occurred. Please try again.");
    });
  });
});
