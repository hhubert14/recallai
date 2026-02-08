import { describe, it, expect, vi } from "vitest";
import {
  createBattleRoomChannel,
  type SlotUpdatedEvent,
  type GameStartingEvent,
  type QuestionStartEvent,
  type AnswerSubmittedEvent,
  type QuestionRevealEvent,
  type GameFinishedEvent,
  type BattleRoomPresenceState,
} from "./battle-room-channel";

describe("battle-room-channel", () => {
  describe("createBattleRoomChannel", () => {
    it("creates a channel with the correct name", () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      };

      const mockSupabase = {
        channel: vi.fn().mockReturnValue(mockChannel),
      };

      createBattleRoomChannel(
        mockSupabase as never,
        "abc-123",
        "user-456"
      );

      expect(mockSupabase.channel).toHaveBeenCalledWith(
        "room:abc-123",
        expect.objectContaining({
          config: expect.objectContaining({
            presence: { key: "user-456", enabled: true },
            broadcast: { self: false },
          }),
        })
      );
    });

    it("returns the created channel", () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      };

      const mockSupabase = {
        channel: vi.fn().mockReturnValue(mockChannel),
      };

      const result = createBattleRoomChannel(
        mockSupabase as never,
        "abc-123",
        "user-456"
      );

      expect(result).toBe(mockChannel);
    });
  });

  describe("types", () => {
    it("SlotUpdatedEvent has correct shape", () => {
      const event: SlotUpdatedEvent = {
        slotIndex: 0,
        slotType: "bot",
        userId: null,
        botName: "SmartBot",
      };
      expect(event.slotIndex).toBe(0);
      expect(event.slotType).toBe("bot");
    });

    it("GameStartingEvent has correct shape", () => {
      const event: GameStartingEvent = {
        startsAt: "2025-01-01T00:00:00Z",
      };
      expect(event.startsAt).toBe("2025-01-01T00:00:00Z");
    });

    it("QuestionStartEvent has correct shape", () => {
      const event: QuestionStartEvent = {
        questionIndex: 0,
        startsAt: "2025-01-01T00:00:00Z",
      };
      expect(event.questionIndex).toBe(0);
    });

    it("AnswerSubmittedEvent has correct shape", () => {
      const event: AnswerSubmittedEvent = {
        userId: "user-123",
        questionIndex: 0,
      };
      expect(event.userId).toBe("user-123");
    });

    it("QuestionRevealEvent has correct shape", () => {
      const event: QuestionRevealEvent = {
        questionIndex: 0,
        correctOptionIndex: 2,
        results: [
          {
            userId: "user-123",
            selectedOptionIndex: 2,
            isCorrect: true,
            pointsAwarded: 100,
          },
        ],
      };
      expect(event.results).toHaveLength(1);
    });

    it("GameFinishedEvent has correct shape", () => {
      const event: GameFinishedEvent = {
        finalStandings: [
          { userId: "user-123", totalPoints: 500, rank: 1 },
        ],
      };
      expect(event.finalStandings).toHaveLength(1);
    });

    it("BattleRoomPresenceState has correct shape", () => {
      const state: BattleRoomPresenceState = {
        userId: "user-123",
        onlineAt: "2025-01-01T00:00:00Z",
      };
      expect(state.userId).toBe("user-123");
    });
  });
});
