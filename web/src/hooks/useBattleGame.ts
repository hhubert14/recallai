"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BattleSlot } from "@/app/dashboard/battle/_components/types";
import type {
  AnswerSubmittedEvent,
  QuestionRevealEvent,
  GameFinishedEvent,
  BattleRoomPresenceState,
} from "@/lib/battle-room-channel";

export type GamePhase =
  | "waiting"
  | "question_active"
  | "answer_submitted"
  | "reveal"
  | "finished";

export interface QuestionData {
  index: number;
  text: string;
  options: { id: number; optionText: string }[];
  startedAt: string;
}

export interface RevealData {
  correctOptionId: number;
  results: Array<{
    slotIndex: number;
    selectedOptionId: number | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
}

export interface FinalResult {
  slotIndex: number;
  totalPoints: number;
  rank: number;
}

interface QuestionStartData {
  questionIndex: number;
  questionText: string;
  options: { id: number; optionText: string }[];
  startedAt: string;
}

interface UseBattleGameProps {
  publicId: string;
  userId: string;
  isHost: boolean;
  channel: RealtimeChannel | null;
  sendEvent: <E extends string>(event: E, payload: unknown) => Promise<void>;
  slots: BattleSlot[];
  timeLimitSeconds: number;
  questionCount: number;
  hostUserId: string;
  onlineUsers: BattleRoomPresenceState[];
  initialQuestion: QuestionData | null;
}

export function useBattleGame({
  publicId,
  userId,
  isHost,
  sendEvent,
  slots,
  timeLimitSeconds,
  questionCount,
  hostUserId,
  onlineUsers,
  initialQuestion,
}: UseBattleGameProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>(
    initialQuestion ? "question_active" : "waiting"
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    initialQuestion
  );
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [scores, setScores] = useState<Map<number, number>>(new Map());
  const [playersAnswered, setPlayersAnswered] = useState<Set<number>>(new Set());
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [finalResults, setFinalResults] = useState<FinalResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitializedRef = useRef(false);
  const currentQuestionIndexRef = useRef(
    initialQuestion ? initialQuestion.index : -1
  );
  const scoresRef = useRef<Map<number, number>>(scores);
  const revealingRef = useRef(false);

  // Find current user's slot index
  const mySlotIndex = slots.findIndex(
    (s) => s.userId === userId
  );

  // --- Timer logic ---
  const startTimer = useCallback((startedAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, timeLimitSeconds - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 100);
  }, [timeLimitSeconds]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer for initial question (late-joiner catch-up)
  useEffect(() => {
    if (initialQuestion) {
      startTimer(initialQuestion.startedAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // --- API calls ---
  async function callAdvance(): Promise<QuestionStartData | null> {
    try {
      const res = await fetch(`/api/v1/battle/rooms/${publicId}/advance`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") return null;
      return {
        questionIndex: data.data.questionIndex,
        questionText: data.data.questionText,
        options: data.data.options,
        startedAt: data.data.currentQuestionStartedAt,
      };
    } catch {
      return null;
    }
  }

  async function callBotAnswers(): Promise<void> {
    try {
      await fetch(`/api/v1/battle/rooms/${publicId}/bot-answers`, {
        method: "POST",
      });
    } catch {
      // Bot answer failures are non-critical
    }
  }

  async function callQuestionResults(): Promise<RevealData | null> {
    try {
      const res = await fetch(
        `/api/v1/battle/rooms/${publicId}/question-results`
      );
      const data = await res.json();
      if (!res.ok || data.status !== "success") return null;
      return {
        correctOptionId: data.data.correctOptionId,
        results: data.data.results.map(
          (r: { slotIndex: number; selectedOptionId: number | null; isCorrect: boolean; score: number }) => ({
            slotIndex: r.slotIndex,
            selectedOptionId: r.selectedOptionId,
            isCorrect: r.isCorrect,
            pointsAwarded: r.score,
          })
        ),
      };
    } catch {
      return null;
    }
  }

  async function callGetCurrentQuestion(): Promise<QuestionStartData | null> {
    try {
      const res = await fetch(
        `/api/v1/battle/rooms/${publicId}/current-question`
      );
      const data = await res.json();
      if (!res.ok || data.status !== "success") return null;
      return {
        questionIndex: data.data.questionIndex,
        questionText: data.data.questionText,
        options: data.data.options,
        startedAt: data.data.startedAt,
      };
    } catch {
      return null;
    }
  }

  async function callFinish(): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/battle/rooms/${publicId}/finish`, {
        method: "POST",
      });
      const data = await res.json();
      return res.ok && data.status === "success";
    } catch {
      return false;
    }
  }

  // --- State transitions ---
  function transitionToQuestion(data: QuestionStartData) {
    setCurrentQuestion({
      index: data.questionIndex,
      text: data.questionText,
      options: data.options,
      startedAt: data.startedAt,
    });
    currentQuestionIndexRef.current = data.questionIndex;
    revealingRef.current = false;
    setSelectedOptionId(null);
    setPlayersAnswered(new Set());
    setRevealData(null);
    setGamePhase("question_active");
    startTimer(data.startedAt);
  }

  function transitionToReveal(data: RevealData) {
    stopTimer();
    setRevealData(data);
    setGamePhase("reveal");

    // Update cumulative scores from reveal results
    setScores((prev) => {
      const next = new Map(prev);
      for (const r of data.results) {
        const current = next.get(r.slotIndex) ?? 0;
        next.set(r.slotIndex, current + r.pointsAwarded);
      }
      scoresRef.current = next;
      return next;
    });
  }

  function transitionToFinished(standings: FinalResult[]) {
    stopTimer();
    setFinalResults(standings);
    setGamePhase("finished");
  }

  // --- Host orchestration ---
  async function hostAdvanceAndBroadcast() {
    const questionData = await callAdvance();
    if (!questionData) return;

    transitionToQuestion(questionData);

    // Broadcast to other clients
    await sendEvent("question_start", {
      questionIndex: questionData.questionIndex,
      questionText: questionData.questionText,
      options: questionData.options,
      startedAt: questionData.startedAt,
    });

    // Trigger bot answers
    await callBotAnswers();

    // Schedule bot answer_submitted broadcasts at staggered delays
    const botSlots = slots.filter((s) => s.slotType === "bot");
    for (const botSlot of botSlots) {
      const delay = 1500 + Math.random() * 2500;
      setTimeout(async () => {
        setPlayersAnswered((prev) => new Set([...prev, botSlot.slotIndex]));
        await sendEvent("answer_submitted", {
          slotIndex: botSlot.slotIndex,
          questionIndex: questionData.questionIndex,
        });
      }, delay);
    }
  }

  async function hostRevealAndMaybeAdvance() {
    if (revealingRef.current) return;
    revealingRef.current = true;

    const results = await callQuestionResults();
    if (!results) {
      revealingRef.current = false;
      return;
    }

    transitionToReveal(results);

    // Broadcast reveal to other clients
    await sendEvent("question_reveal", {
      questionIndex: currentQuestionIndexRef.current,
      ...results,
    });

    // Wait 5 seconds, then advance or finish
    setTimeout(async () => {
      const nextIndex = currentQuestionIndexRef.current + 1;
      if (nextIndex >= questionCount) {
        // Last question — finish game
        await callFinish();

        // Build final standings from scores
        const standings = buildFinalStandings();
        transitionToFinished(standings);

        await sendEvent("game_finished", {
          finalStandings: standings,
        });
      } else {
        // More questions — advance
        await hostAdvanceAndBroadcast();
      }
    }, 5000);
  }

  function buildFinalStandings(): FinalResult[] {
    // Read from scoresRef to avoid stale closure over scores state
    const currentScores = scoresRef.current;
    const scoreEntries = [...currentScores.entries()];
    // Also include any slots without scores (0 points)
    for (const slot of slots) {
      if (
        (slot.slotType === "player" || slot.slotType === "bot") &&
        !currentScores.has(slot.slotIndex)
      ) {
        scoreEntries.push([slot.slotIndex, 0]);
      }
    }

    scoreEntries.sort((a, b) => b[1] - a[1]);

    return scoreEntries.map(([slotIndex, totalPoints], idx) => ({
      slotIndex,
      totalPoints,
      rank: idx + 1,
    }));
  }

  // --- Host: auto-advance first question on mount ---
  useEffect(() => {
    if (!isHost || hasInitializedRef.current) return;

    const timeout = setTimeout(() => {
      hasInitializedRef.current = true;
      hostAdvanceAndBroadcast();
    }, 50);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost]);

  // --- Non-host: poll for current question if stuck in waiting ---
  useEffect(() => {
    if (isHost || gamePhase !== "waiting") return;

    let cancelled = false;

    const poll = async () => {
      // Wait 1s before first poll, then retry every 2s
      await new Promise((r) => setTimeout(r, 1000));

      while (!cancelled) {
        const data = await callGetCurrentQuestion();
        if (cancelled) break;
        if (data) {
          transitionToQuestion(data);
          break;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, gamePhase]);

  // --- Host: auto-reveal when timer expires ---
  useEffect(() => {
    if (!isHost || (gamePhase !== "question_active" && gamePhase !== "answer_submitted")) return;

    if (timeRemaining <= 0) {
      hostRevealAndMaybeAdvance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isHost, gamePhase]);

  // --- Host: auto-reveal when all participants have answered ---
  useEffect(() => {
    if (!isHost) return;
    if (gamePhase !== "question_active" && gamePhase !== "answer_submitted") return;

    const activeSlots = slots.filter(
      (s) => s.slotType === "player" || s.slotType === "bot"
    );
    if (activeSlots.length === 0) return;

    const allAnswered = activeSlots.every((s) =>
      playersAnswered.has(s.slotIndex)
    );

    if (allAnswered) {
      hostRevealAndMaybeAdvance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersAnswered, isHost, gamePhase, slots]);

  // --- Non-host: fallback if host disconnects during reveal ---
  useEffect(() => {
    if (isHost || gamePhase !== "reveal") return;

    const hostOnline = onlineUsers.some((u) => u.userId === hostUserId);
    if (hostOnline) return;

    // Host is offline during reveal — after 3s, take over
    const timeout = setTimeout(async () => {
      const nextIndex = currentQuestionIndexRef.current + 1;
      if (nextIndex >= questionCount) {
        await callFinish();
        const standings = buildFinalStandings();
        transitionToFinished(standings);
        await sendEvent("game_finished", { finalStandings: standings });
      } else {
        await hostAdvanceAndBroadcast();
      }
    }, 3000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, isHost, onlineUsers, hostUserId]);

  // --- Public API ---
  async function submitAnswer(optionId: number) {
    if (gamePhase !== "question_active" || isSubmitting || selectedOptionId !== null) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/battle/rooms/${publicId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setSelectedOptionId(optionId);
        setGamePhase("answer_submitted");

        if (mySlotIndex >= 0) {
          // Mark self as answered (score updates come from transitionToReveal)
          setPlayersAnswered((prev) => new Set([...prev, mySlotIndex]));

          // Broadcast to others
          await sendEvent("answer_submitted", {
            slotIndex: mySlotIndex,
            questionIndex: currentQuestionIndexRef.current,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Broadcast event handlers (called by parent component) ---
  function handleQuestionStart(data: QuestionStartData) {
    transitionToQuestion(data);
  }

  function handleAnswerSubmitted(event: AnswerSubmittedEvent) {
    if (event.questionIndex !== currentQuestionIndexRef.current) return;
    setPlayersAnswered((prev) => new Set([...prev, event.slotIndex]));
  }

  function handleQuestionReveal(event: QuestionRevealEvent) {
    transitionToReveal({
      correctOptionId: event.correctOptionId,
      results: event.results,
    });
  }

  function handleGameFinished(event: GameFinishedEvent) {
    transitionToFinished(event.finalStandings);
  }

  return {
    gamePhase,
    currentQuestion,
    timeRemaining,
    selectedOptionId,
    scores,
    playersAnswered,
    revealData,
    finalResults,
    isSubmitting,
    submitAnswer,
    handleQuestionStart,
    handleAnswerSubmitted,
    handleQuestionReveal,
    handleGameFinished,
  };
}
