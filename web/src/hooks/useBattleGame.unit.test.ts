import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBattleGame, type GamePhase } from "./useBattleGame";
import type { BattleSlot } from "@/app/dashboard/battle/_components/types";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sendEvent
const mockSendEvent = vi.fn();

// Mock channel
const mockChannel = {} as Parameters<typeof useBattleGame>[0]["channel"];

function createSlots(): BattleSlot[] {
  return [
    { slotIndex: 0, slotType: "player", userId: "host-123", botName: null },
    { slotIndex: 1, slotType: "player", userId: "player-456", botName: null },
    { slotIndex: 2, slotType: "bot", userId: null, botName: "Bot Alpha" },
    { slotIndex: 3, slotType: "locked", userId: null, botName: null },
  ];
}

function defaultProps() {
  return {
    publicId: "room-pub-123",
    userId: "host-123",
    isHost: true,
    channel: mockChannel,
    sendEvent: mockSendEvent,
    slots: createSlots(),
    timeLimitSeconds: 15,
    questionCount: 3,
    hostUserId: "host-123",
    onlineUsers: [
      { userId: "host-123", onlineAt: "2025-01-01T00:00:00Z" },
      { userId: "player-456", onlineAt: "2025-01-01T00:00:00Z" },
    ],
    initialQuestion: null,
  };
}

function mockAdvanceResponse(questionIndex: number) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        status: "success",
        data: {
          questionIndex,
          questionId: 10 + questionIndex * 10,
          questionText: `Question ${questionIndex + 1}?`,
          options: [
            { id: 100 + questionIndex * 4, optionText: "Option A" },
            { id: 101 + questionIndex * 4, optionText: "Option B" },
            { id: 102 + questionIndex * 4, optionText: "Option C" },
            { id: 103 + questionIndex * 4, optionText: "Option D" },
          ],
          currentQuestionStartedAt: new Date().toISOString(),
        },
      }),
  };
}

function mockBotAnswersResponse() {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        status: "success",
        data: { botAnswers: [{ slotId: 3, isCorrect: true, score: 800 }] },
      }),
  };
}

function mockAnswerResponse(isCorrect: boolean, score: number) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        status: "success",
        data: { isCorrect, score },
      }),
  };
}

function mockQuestionResultsResponse() {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        status: "success",
        data: {
          questionIndex: 0,
          correctOptionId: 101,
          results: [
            { slotIndex: 0, userId: "host-123", botName: null, selectedOptionId: 101, isCorrect: true, score: 800 },
            { slotIndex: 1, userId: "player-456", botName: null, selectedOptionId: 100, isCorrect: false, score: 0 },
            { slotIndex: 2, userId: null, botName: "Bot Alpha", selectedOptionId: 101, isCorrect: true, score: 867 },
          ],
        },
      }),
  };
}

function mockFinishResponse() {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        status: "success",
        data: { room: { publicId: "room-pub-123", status: "finished" } },
      }),
  };
}

describe("useBattleGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in waiting phase", () => {
    // Don't trigger initial advance
    mockFetch.mockResolvedValue(mockAdvanceResponse(0));

    const { result } = renderHook(() => useBattleGame(defaultProps()));

    expect(result.current.gamePhase).toBe("waiting");
  });

  it("transitions to question_active after host advances first question", async () => {
    mockFetch
      .mockResolvedValueOnce(mockAdvanceResponse(0))
      .mockResolvedValueOnce(mockBotAnswersResponse());

    const { result } = renderHook(() => useBattleGame(defaultProps()));

    // Trigger the initial advance
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.gamePhase).toBe("question_active");
    expect(result.current.currentQuestion).not.toBeNull();
    expect(result.current.currentQuestion?.index).toBe(0);
    expect(result.current.currentQuestion?.text).toBe("Question 1?");
    expect(result.current.currentQuestion?.options).toHaveLength(4);
  });

  it("submits an answer and transitions to answer_submitted", async () => {
    mockFetch
      .mockResolvedValueOnce(mockAdvanceResponse(0))
      .mockResolvedValueOnce(mockBotAnswersResponse())
      .mockResolvedValueOnce(mockAnswerResponse(true, 800));

    const { result } = renderHook(() => useBattleGame(defaultProps()));

    // Advance to question
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.gamePhase).toBe("question_active");

    // Submit answer
    await act(async () => {
      await result.current.submitAnswer(101);
    });

    expect(result.current.gamePhase).toBe("answer_submitted");
    expect(result.current.selectedOptionId).toBe(101);
  });

  it("decrements timeRemaining over time", async () => {
    mockFetch
      .mockResolvedValueOnce(mockAdvanceResponse(0))
      .mockResolvedValueOnce(mockBotAnswersResponse());

    const { result } = renderHook(() => useBattleGame(defaultProps()));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    const initialTime = result.current.timeRemaining;
    expect(initialTime).toBeGreaterThan(0);
    expect(initialTime).toBeLessThanOrEqual(15);

    // Advance 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(result.current.timeRemaining).toBeLessThan(initialTime);
  });

  it("tracks scores from reveal data", async () => {
    const props = {
      ...defaultProps(),
      userId: "player-456",
      isHost: false,
    };

    const { result } = renderHook(() => useBattleGame(props));

    // Start question
    await act(async () => {
      result.current.handleQuestionStart({
        questionIndex: 0,
        questionText: "Question 1?",
        options: [
          { id: 100, optionText: "Option A" },
          { id: 101, optionText: "Option B" },
          { id: 102, optionText: "Option C" },
          { id: 103, optionText: "Option D" },
        ],
        startedAt: new Date().toISOString(),
      });
    });

    // Simulate reveal with scores
    await act(async () => {
      result.current.handleQuestionReveal({
        questionIndex: 0,
        correctOptionId: 101,
        results: [
          { slotIndex: 0, selectedOptionId: 101, isCorrect: true, pointsAwarded: 800 },
          { slotIndex: 1, selectedOptionId: 100, isCorrect: false, pointsAwarded: 0 },
        ],
      });
    });

    expect(result.current.scores.get(0)).toBe(800);
    expect(result.current.scores.get(1)).toBe(0);
  });

  it("non-host reacts to question_start broadcast", async () => {
    // No auto-advance for non-host
    const props = {
      ...defaultProps(),
      userId: "player-456",
      isHost: false,
    };

    const { result } = renderHook(() => useBattleGame(props));

    expect(result.current.gamePhase).toBe("waiting");

    // Simulate receiving a question_start broadcast
    await act(async () => {
      result.current.handleQuestionStart({
        questionIndex: 0,
        questionText: "Question 1?",
        options: [
          { id: 100, optionText: "Option A" },
          { id: 101, optionText: "Option B" },
          { id: 102, optionText: "Option C" },
          { id: 103, optionText: "Option D" },
        ],
        startedAt: new Date().toISOString(),
      });
    });

    expect(result.current.gamePhase).toBe("question_active");
    expect(result.current.currentQuestion?.index).toBe(0);
  });

  it("non-host reacts to question_reveal broadcast", async () => {
    const props = {
      ...defaultProps(),
      userId: "player-456",
      isHost: false,
    };

    const { result } = renderHook(() => useBattleGame(props));

    // Start question first
    await act(async () => {
      result.current.handleQuestionStart({
        questionIndex: 0,
        questionText: "Question 1?",
        options: [
          { id: 100, optionText: "Option A" },
          { id: 101, optionText: "Option B" },
          { id: 102, optionText: "Option C" },
          { id: 103, optionText: "Option D" },
        ],
        startedAt: new Date().toISOString(),
      });
    });

    // Simulate reveal broadcast
    await act(async () => {
      result.current.handleQuestionReveal({
        questionIndex: 0,
        correctOptionId: 101,
        results: [
          { slotIndex: 0, selectedOptionId: 101, isCorrect: true, pointsAwarded: 800 },
          { slotIndex: 1, selectedOptionId: 100, isCorrect: false, pointsAwarded: 0 },
        ],
      });
    });

    expect(result.current.gamePhase).toBe("reveal");
    expect(result.current.revealData?.correctOptionId).toBe(101);
  });

  it("non-host reacts to game_finished broadcast", async () => {
    const props = {
      ...defaultProps(),
      userId: "player-456",
      isHost: false,
    };

    const { result } = renderHook(() => useBattleGame(props));

    // Simulate game finished broadcast
    await act(async () => {
      result.current.handleGameFinished({
        finalStandings: [
          { slotIndex: 2, totalPoints: 1600, rank: 1 },
          { slotIndex: 0, totalPoints: 800, rank: 2 },
          { slotIndex: 1, totalPoints: 0, rank: 3 },
        ],
      });
    });

    expect(result.current.gamePhase).toBe("finished");
    expect(result.current.finalResults).toHaveLength(3);
    expect(result.current.finalResults?.[0].rank).toBe(1);
  });

  it("non-host reacts to answer_submitted broadcast", async () => {
    const props = {
      ...defaultProps(),
      userId: "player-456",
      isHost: false,
    };

    const { result } = renderHook(() => useBattleGame(props));

    // Start question
    await act(async () => {
      result.current.handleQuestionStart({
        questionIndex: 0,
        questionText: "Question 1?",
        options: [
          { id: 100, optionText: "Option A" },
          { id: 101, optionText: "Option B" },
          { id: 102, optionText: "Option C" },
          { id: 103, optionText: "Option D" },
        ],
        startedAt: new Date().toISOString(),
      });
    });

    // Simulate answer_submitted broadcast from another player
    await act(async () => {
      result.current.handleAnswerSubmitted({
        slotIndex: 0,
        questionIndex: 0,
      });
    });

    expect(result.current.playersAnswered.has(0)).toBe(true);
  });

  it("prevents double answer submission", async () => {
    mockFetch
      .mockResolvedValueOnce(mockAdvanceResponse(0))
      .mockResolvedValueOnce(mockBotAnswersResponse())
      .mockResolvedValueOnce(mockAnswerResponse(true, 800));

    const { result } = renderHook(() => useBattleGame(defaultProps()));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    // Submit first answer
    await act(async () => {
      await result.current.submitAnswer(101);
    });

    // Try to submit again - should be no-op (already in answer_submitted phase)
    const fetchCallCount = mockFetch.mock.calls.length;
    await act(async () => {
      await result.current.submitAnswer(102);
    });

    // No additional fetch call
    expect(mockFetch.mock.calls.length).toBe(fetchCallCount);
    expect(result.current.selectedOptionId).toBe(101);
  });
});
