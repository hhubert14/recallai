import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { BattleRoomSlotType } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

// --- Broadcast Event Types ---

export interface SlotUpdatedEvent {
  slotIndex: number;
  slotType: BattleRoomSlotType;
  userId: string | null;
  botName: string | null;
}

export interface GameStartingEvent {
  startsAt: string;
}

export interface QuestionStartEvent {
  questionIndex: number;
  startsAt: string;
}

export interface AnswerSubmittedEvent {
  userId: string;
  questionIndex: number;
}

export interface QuestionRevealEvent {
  questionIndex: number;
  correctOptionIndex: number;
  results: Array<{
    userId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
}

export interface GameFinishedEvent {
  finalStandings: Array<{
    userId: string;
    totalPoints: number;
    rank: number;
  }>;
}

export type BattleRoomEventMap = {
  slot_updated: SlotUpdatedEvent;
  game_starting: GameStartingEvent;
  question_start: QuestionStartEvent;
  answer_submitted: AnswerSubmittedEvent;
  question_reveal: QuestionRevealEvent;
  game_finished: GameFinishedEvent;
};

export type BattleRoomEventName = keyof BattleRoomEventMap;

// --- Presence Types ---

export interface BattleRoomPresenceState {
  userId: string;
  onlineAt: string;
}

// --- Lobby Broadcast Types ---

export const LOBBY_SLOT_UPDATES_CHANNEL = "lobby:slot_updates";

export interface LobbySlotSummaryPayload {
  publicId: string;
  slotSummary: {
    playerCount: number;
    botCount: number;
    openSlots: number;
  };
}

export interface LobbyRoomClosedPayload {
  publicId: string;
}

// --- Channel Factory ---

export function createBattleRoomChannel(
  supabase: SupabaseClient,
  roomPublicId: string,
  userId: string
): RealtimeChannel {
  return supabase.channel(`room:${roomPublicId}`, {
    config: {
      presence: { key: userId, enabled: true },
      broadcast: { self: false },
    },
  });
}
