"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { createBattleRoomChannel } from "@/lib/battle-room-channel";
import { useBattleRoomEvents } from "@/hooks/useBattleRoomEvents";
import { useBattleRoomPresence } from "@/hooks/useBattleRoomPresence";
import { useBattleGame } from "@/hooks/useBattleGame";
import type { QuestionData } from "@/hooks/useBattleGame";
import { createClient } from "@/lib/supabase/client";
import { QuestionDisplay } from "./QuestionDisplay";
import { GameTimer } from "./GameTimer";
import { LiveScoreboard } from "./LiveScoreboard";
import { RevealPhase } from "./RevealPhase";
import { GameResults } from "./GameResults";
import type { BattleSlot } from "../../../_components/types";

interface GameContainerProps {
  publicId: string;
  userId: string;
  isHost: boolean;
  slots: BattleSlot[];
  timeLimitSeconds: number;
  questionCount: number;
  hostUserId: string;
  roomName: string;
  initialQuestion: QuestionData | null;
}

export function GameContainer({
  publicId,
  userId,
  isHost,
  slots,
  timeLimitSeconds,
  questionCount,
  hostUserId,
  roomName,
  initialQuestion,
}: GameContainerProps) {
  const supabase = useMemo(() => createClient(), []);
  const [channel, setChannel] = useState<ReturnType<
    typeof createBattleRoomChannel
  > | null>(null);

  // Create and subscribe to channel
  useEffect(() => {
    const ch = createBattleRoomChannel(supabase, publicId, userId);
    setChannel(ch);

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({
          userId,
          onlineAt: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, publicId, userId]);

  const { onlineUsers } = useBattleRoomPresence(channel);

  const { sendEvent } = useBattleRoomEvents(channel, {
    onQuestionStart: (event) => {
      // Non-host receives question data via extended broadcast
      // The event includes question data sent by host
      const payload = event as unknown as {
        questionIndex: number;
        questionText: string;
        options: { id: number; optionText: string }[];
        startedAt: string;
      };
      game.handleQuestionStart(payload);
    },
    onAnswerSubmitted: (event) => {
      game.handleAnswerSubmitted(event);
    },
    onQuestionReveal: (event) => {
      game.handleQuestionReveal(event);
    },
    onGameFinished: (event) => {
      game.handleGameFinished(event);
    },
  });

  const game = useBattleGame({
    publicId,
    userId,
    isHost,
    channel,
    sendEvent: sendEvent as (event: string, payload: unknown) => Promise<void>,
    slots,
    timeLimitSeconds,
    questionCount,
    hostUserId,
    onlineUsers,
    initialQuestion,
  });

  // Waiting phase — show loading
  if (game.gamePhase === "waiting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Starting game...</p>
        </div>
      </div>
    );
  }

  // Finished phase — show results
  if (game.gamePhase === "finished" && game.finalResults) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex-1 container py-8 px-4 md:px-8 max-w-3xl mx-auto">
          <GameResults
            finalResults={game.finalResults}
            slots={slots}
            userId={userId}
            roomName={roomName}
          />
        </div>
      </div>
    );
  }

  // Question / Answer / Reveal phases
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 container py-6 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Header with timer and question counter */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Question {(game.currentQuestion?.index ?? 0) + 1} of {questionCount}
          </div>
          <GameTimer
            timeRemaining={game.timeRemaining}
            timeLimitSeconds={timeLimitSeconds}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content: question or reveal */}
          <div className="lg:col-span-2">
            {game.gamePhase === "reveal" && game.revealData ? (
              <RevealPhase
                question={game.currentQuestion}
                revealData={game.revealData}
                slots={slots}
                selectedOptionId={game.selectedOptionId}
              />
            ) : (
              <QuestionDisplay
                question={game.currentQuestion}
                selectedOptionId={game.selectedOptionId}
                onSelectOption={game.submitAnswer}
                isSubmitting={game.isSubmitting}
                gamePhase={game.gamePhase}
                playersAnswered={game.playersAnswered}
                slots={slots}
              />
            )}
          </div>

          {/* Sidebar: scoreboard */}
          <div className="lg:col-span-1">
            <LiveScoreboard
              slots={slots}
              scores={game.scores}
              userId={userId}
              revealData={game.gamePhase === "reveal" ? game.revealData : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
