"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  BattleRoomEventMap,
  BattleRoomEventName,
  SlotUpdatedEvent,
  GameStartingEvent,
  QuestionStartEvent,
  AnswerSubmittedEvent,
  QuestionRevealEvent,
  GameFinishedEvent,
} from "@/lib/battle-room-channel";

export interface BattleRoomEventHandlers {
  onSlotUpdated?: (event: SlotUpdatedEvent) => void;
  onGameStarting?: (event: GameStartingEvent) => void;
  onQuestionStart?: (event: QuestionStartEvent) => void;
  onAnswerSubmitted?: (event: AnswerSubmittedEvent) => void;
  onQuestionReveal?: (event: QuestionRevealEvent) => void;
  onGameFinished?: (event: GameFinishedEvent) => void;
}

const EVENT_HANDLER_MAP: Array<{
  event: BattleRoomEventName;
  handlerKey: keyof BattleRoomEventHandlers;
}> = [
  { event: "slot_updated", handlerKey: "onSlotUpdated" },
  { event: "game_starting", handlerKey: "onGameStarting" },
  { event: "question_start", handlerKey: "onQuestionStart" },
  { event: "answer_submitted", handlerKey: "onAnswerSubmitted" },
  { event: "question_reveal", handlerKey: "onQuestionReveal" },
  { event: "game_finished", handlerKey: "onGameFinished" },
];

export function useBattleRoomEvents(
  channel: RealtimeChannel | null,
  handlers: BattleRoomEventHandlers
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!channel) return;

    for (const { event, handlerKey } of EVENT_HANDLER_MAP) {
      if (handlersRef.current[handlerKey]) {
        channel.on(
          "broadcast",
          { event },
          (payload: { payload: BattleRoomEventMap[typeof event] }) => {
            const handler = handlersRef.current[handlerKey];
            if (handler) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (handler as (event: any) => void)(payload.payload);
            }
          }
        );
      }
    }
  }, [channel]);

  const sendEvent = useCallback(
    async <E extends BattleRoomEventName>(
      event: E,
      payload: BattleRoomEventMap[E]
    ) => {
      if (!channel) return;
      await channel.send({
        type: "broadcast",
        event,
        payload,
      });
    },
    [channel]
  );

  return { sendEvent };
}
