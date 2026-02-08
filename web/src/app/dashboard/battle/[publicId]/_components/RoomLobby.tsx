"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Clock, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBattleLobby } from "@/hooks/useBattleLobby";
import { useBattleRoomPresence } from "@/hooks/useBattleRoomPresence";
import { useBattleRoomEvents } from "@/hooks/useBattleRoomEvents";
import { useLobbyPresenceCleanup } from "@/hooks/useLobbyPresenceCleanup";
import {
  createBattleRoomChannel,
  LOBBY_SLOT_UPDATES_CHANNEL,
  type SlotUpdatedEvent,
  type GameStartingEvent,
  type LobbySlotSummaryPayload,
} from "@/lib/battle-room-channel";
import { createClient } from "@/lib/supabase/client";
import { SlotCard } from "./SlotCard";
import { HostControls } from "./HostControls";
import { QuestionBankPreview } from "../../_components/QuestionBankPreview";
import type { BattleRoomDetail, BattleSlot } from "../../_components/types";

function calculateSlotSummary(slots: BattleSlot[]): LobbySlotSummaryPayload["slotSummary"] {
  let playerCount = 0;
  let botCount = 0;
  let openSlots = 0;
  for (const slot of slots) {
    if (slot.slotType === "player") playerCount++;
    else if (slot.slotType === "bot") botCount++;
    else if (slot.slotType === "empty") openSlots++;
  }
  return { playerCount, botCount, openSlots };
}

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
  const { leaveRoom, closeRoom, updateSlot, kickPlayer, startGame, isLoading, error } =
    useBattleLobby();

  const [slots, setSlots] = useState<BattleSlot[]>(initialSlots);

  // Sync slots when server data changes (e.g. browser back/forward navigation)
  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  // Force fresh server data on mount — back/forward navigation can serve
  // stale Router Cache despite force-dynamic on the page
  useEffect(() => {
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  const supabase = useMemo(() => createClient(), []);
  const [channel, setChannel] = useState<ReturnType<
    typeof createBattleRoomChannel
  > | null>(null);

  // Create and subscribe to channel
  useEffect(() => {
    const ch = createBattleRoomChannel(supabase, room.publicId, userId);
    setChannel(ch);

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({
          userId,
          onlineAt: new Date().toISOString(),
        });

        // Broadcast own slot so other clients see us
        const mySlot = initialSlots.find((s) => s.userId === userId);
        if (mySlot) {
          await ch.send({
            type: "broadcast",
            event: "slot_updated",
            payload: {
              slotIndex: mySlot.slotIndex,
              slotType: mySlot.slotType,
              userId: mySlot.userId,
              botName: mySlot.botName,
            },
          });
        }
      }
    });

    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialSlots is only read for the
    // initial broadcast; channel lifecycle should not depend on slot data changes.
  }, [supabase, room.publicId, userId]);

  // Lobby broadcast channel for slot summary updates
  const [lobbyChannel, setLobbyChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);

  useEffect(() => {
    const ch = supabase.channel(LOBBY_SLOT_UPDATES_CHANNEL);
    ch.subscribe();
    setLobbyChannel(ch);

    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase]);

  // Presence tracking
  const { onlineUsers } = useBattleRoomPresence(channel);

  // Broadcast event handlers
  const { sendEvent } = useBattleRoomEvents(channel, {
    onSlotUpdated: (event: SlotUpdatedEvent) => {
      // Check if this user was kicked before updating state
      const wasKicked = slots.some(
        (s) =>
          s.slotIndex === event.slotIndex &&
          s.userId === userId &&
          event.userId !== userId
      );

      setSlots((prev) =>
        prev.map((s) =>
          s.slotIndex === event.slotIndex
            ? {
                slotIndex: event.slotIndex,
                slotType: event.slotType,
                userId: event.userId,
                botName: event.botName,
              }
            : s
        )
      );

      if (wasKicked) {
        router.push("/dashboard/battle");
      }
    },
    onGameStarting: (_event: GameStartingEvent) => {
      if (!isHost) {
        router.push(`/dashboard/battle/${room.publicId}/play`);
      }
    },
  });

  // Auto-cleanup disconnected players
  useLobbyPresenceCleanup({
    onlineUsers,
    slots,
    hostUserId: room.hostUserId,
    userId,
    isHost,
    publicId: room.publicId,
    kickPlayer: (pubId, slotIndex) => kickPlayer(pubId, slotIndex),
    closeRoom: (pubId) => closeRoom(pubId),
    onPlayerKicked: async (slotIndex) => {
      const clearedSlot: BattleSlot = {
        slotIndex,
        slotType: "empty",
        userId: null,
        botName: null,
      };
      const newSlots = slots.map((s) =>
        s.slotIndex === slotIndex ? clearedSlot : s
      );
      setSlots(newSlots);
      await sendEvent("slot_updated", clearedSlot);
      await lobbyChannel?.send({
        type: "broadcast",
        event: "slot_summary_updated",
        payload: {
          publicId: room.publicId,
          slotSummary: calculateSlotSummary(newSlots),
        },
      });
    },
    onRoomClosed: async () => {
      await lobbyChannel?.send({
        type: "broadcast",
        event: "room_closed",
        payload: { publicId: room.publicId },
      });
      router.push("/dashboard/battle");
    },
  });

  async function handleLeave() {
    const success = await leaveRoom(room.publicId);
    if (success) {
      // Broadcast the slot change so other clients see the player left
      const mySlot = slots.find((s) => s.userId === userId);
      if (mySlot) {
        await sendEvent("slot_updated", {
          slotIndex: mySlot.slotIndex,
          slotType: "empty",
          userId: null,
          botName: null,
        });
        await lobbyChannel?.send({
          type: "broadcast",
          event: "slot_summary_updated",
          payload: {
            publicId: room.publicId,
            slotSummary: calculateSlotSummary(
              slots.map((s) =>
                s.slotIndex === mySlot.slotIndex
                  ? { ...s, slotType: "empty" as const, userId: null, botName: null }
                  : s
              )
            ),
          },
        });
      }
      router.push("/dashboard/battle");
    }
  }

  async function handleUpdateSlot(
    slotIndex: number,
    slotType: "bot" | "empty" | "locked"
  ) {
    const updatedSlot = await updateSlot(room.publicId, slotIndex, slotType);
    if (updatedSlot) {
      const newSlots = slots.map((s) =>
        s.slotIndex === slotIndex ? updatedSlot : s
      );
      setSlots(newSlots);
      await sendEvent("slot_updated", {
        slotIndex: updatedSlot.slotIndex,
        slotType: updatedSlot.slotType,
        userId: updatedSlot.userId,
        botName: updatedSlot.botName,
      });
      await lobbyChannel?.send({
        type: "broadcast",
        event: "slot_summary_updated",
        payload: {
          publicId: room.publicId,
          slotSummary: calculateSlotSummary(newSlots),
        },
      });
    }
  }

  async function handleKickPlayer(slotIndex: number) {
    const updatedSlot = await kickPlayer(room.publicId, slotIndex);
    if (updatedSlot) {
      const newSlots = slots.map((s) =>
        s.slotIndex === slotIndex ? updatedSlot : s
      );
      setSlots(newSlots);
      await sendEvent("slot_updated", {
        slotIndex: updatedSlot.slotIndex,
        slotType: updatedSlot.slotType,
        userId: updatedSlot.userId,
        botName: updatedSlot.botName,
      });
      await lobbyChannel?.send({
        type: "broadcast",
        event: "slot_summary_updated",
        payload: {
          publicId: room.publicId,
          slotSummary: calculateSlotSummary(newSlots),
        },
      });
    }
  }

  async function handleStartGame() {
    const success = await startGame(room.publicId);
    if (success) {
      await sendEvent("game_starting", {
        startsAt: new Date().toISOString(),
      });
      router.push(`/dashboard/battle/${room.publicId}/play`);
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
            isOnline={onlineUsers.some((u) => u.userId === slot.userId)}
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
          startError={error}
        />
      )}
    </div>
  );
}
