"use client";

import { useEffect, useRef } from "react";
import type { BattleRoomPresenceState } from "@/lib/battle-room-channel";
import type { BattleSlot } from "@/app/dashboard/battle/_components/types";

export const GRACE_PERIOD_MS = 5_000;

interface UseLobbyPresenceCleanupOptions {
  onlineUsers: BattleRoomPresenceState[];
  slots: BattleSlot[];
  hostUserId: string;
  userId: string;
  isHost: boolean;
  publicId: string;
  kickPlayer: (publicId: string, slotIndex: number) => Promise<BattleSlot | undefined>;
  closeRoom: (publicId: string) => Promise<boolean>;
  onPlayerKicked: (slotIndex: number) => void;
  onRoomClosed: () => void;
}

export function useLobbyPresenceCleanup(options: UseLobbyPresenceCleanupOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const prevOnlineIdsRef = useRef<Set<string> | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const currentOnlineIds = new Set(options.onlineUsers.map((u) => u.userId));

    // On first render, just store the initial set — no diff to compute
    if (prevOnlineIdsRef.current === null) {
      prevOnlineIdsRef.current = currentOnlineIds;
      return;
    }

    const prevIds = prevOnlineIdsRef.current;

    // Cancel timers for users who came back online
    for (const userId of currentOnlineIds) {
      const existingTimer = timersRef.current.get(userId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        timersRef.current.delete(userId);
      }
    }

    // Start timers for users who went offline
    for (const userId of prevIds) {
      if (!currentOnlineIds.has(userId) && !timersRef.current.has(userId)) {
        const timer = setTimeout(() => {
          timersRef.current.delete(userId);
          handleDisconnect(userId);
        }, GRACE_PERIOD_MS);
        timersRef.current.set(userId, timer);
      }
    }

    prevOnlineIdsRef.current = currentOnlineIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- diff-based: only re-run when onlineUsers changes
  }, [options.onlineUsers]);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  function handleDisconnect(disconnectedUserId: string) {
    const {
      slots, hostUserId, userId, isHost, publicId,
      kickPlayer, closeRoom, onPlayerKicked, onRoomClosed,
    } = optionsRef.current;

    if (disconnectedUserId === hostUserId) {
      // Host disconnected — determine if we're the designated closer
      const nonHostPlayerSlots = slots
        .filter((s) => s.slotType === "player" && s.userId !== null && s.userId !== hostUserId)
        .sort((a, b) => a.slotIndex - b.slotIndex);

      const designatedCloserId = nonHostPlayerSlots[0]?.userId;

      if (designatedCloserId === userId) {
        closeRoom(publicId).then(() => {
          onRoomClosed();
        });
      } else {
        onRoomClosed();
      }
    } else if (isHost) {
      // Non-host disconnected and I am host — kick them
      const slot = slots.find((s) => s.userId === disconnectedUserId);
      if (slot) {
        kickPlayer(publicId, slot.slotIndex).then((result) => {
          if (result) {
            onPlayerKicked(slot.slotIndex);
          }
        });
      }
    }
    // Non-host sees another non-host disconnect — do nothing (host handles it)
  }
}
