"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Clock, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBattleLobby } from "@/hooks/useBattleLobby";
import { SlotCard } from "./SlotCard";
import { HostControls } from "./HostControls";
import { QuestionBankPreview } from "../../_components/QuestionBankPreview";
import type { BattleRoomDetail, BattleSlot } from "../../_components/types";

interface RoomLobbyProps {
  room: BattleRoomDetail;
  slots: BattleSlot[];
  userId: string;
  isHost: boolean;
}

export function RoomLobby({
  room,
  slots: initialSlots,
  userId,
  isHost,
}: RoomLobbyProps) {
  const router = useRouter();
  const { leaveRoom, updateSlot, kickPlayer, startGame, isLoading, error } =
    useBattleLobby();

  const [slots, setSlots] = useState<BattleSlot[]>(initialSlots);
  const [startError, setStartError] = useState<string | null>(null);

  async function handleLeave() {
    const success = await leaveRoom(room.publicId);
    if (success) {
      router.push("/dashboard/battle");
    }
  }

  async function handleUpdateSlot(
    slotIndex: number,
    slotType: "bot" | "empty" | "locked"
  ) {
    const updatedSlot = await updateSlot(room.publicId, slotIndex, slotType);
    if (updatedSlot) {
      setSlots((prev) =>
        prev.map((s) => (s.slotIndex === slotIndex ? updatedSlot : s))
      );
    }
  }

  async function handleKickPlayer(slotIndex: number) {
    const updatedSlot = await kickPlayer(room.publicId, slotIndex);
    if (updatedSlot) {
      setSlots((prev) =>
        prev.map((s) => (s.slotIndex === slotIndex ? updatedSlot : s))
      );
    }
  }

  async function handleStartGame() {
    setStartError(null);
    const success = await startGame(room.publicId);
    if (success) {
      router.push(`/dashboard/battle/${room.publicId}/play`);
    } else {
      setStartError(error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Room header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{room.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="size-4" />
              {room.studySetName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {room.timeLimitSeconds}s per question
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="size-4" />
              {room.questionCount} questions
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <QuestionBankPreview roomPublicId={room.publicId} />
          <Button
            variant="outline"
            onClick={handleLeave}
            disabled={isLoading}
          >
            <LogOut className="size-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {slots.map((slot) => (
          <SlotCard
            key={slot.slotIndex}
            slot={slot}
            isHost={isHost}
            isCurrentUser={slot.userId === userId}
            isSlotHost={slot.userId === room.hostUserId}
            onUpdateSlot={handleUpdateSlot}
            onKickPlayer={handleKickPlayer}
          />
        ))}
      </div>

      {/* Host controls */}
      {isHost && (
        <HostControls
          onStartGame={handleStartGame}
          isStarting={false}
          disabled={isLoading}
          startError={startError}
        />
      )}
    </div>
  );
}
