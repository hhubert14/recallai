import type { BattleRoomSlotType } from "@/clean-architecture/domain/entities/battle-room-slot.entity";

export interface BattleRoomSummary {
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
}

export interface BattleSlot {
  slotIndex: number;
  slotType: BattleRoomSlotType;
  userId: string | null;
  botName: string | null;
}

export interface BattleRoomDetail {
  publicId: string;
  hostUserId: string;
  name: string;
  visibility: "public" | "private";
  status: "waiting" | "in_game" | "finished";
  timeLimitSeconds: number;
  questionCount: number;
  studySetId: number;
  studySetName: string;
  createdAt: string;
}

export interface StudySetForBattle {
  publicId: string;
  name: string;
  questionCount: number;
}
