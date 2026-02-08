"use client";

import { useState, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BattleRoomPresenceState } from "@/lib/battle-room-channel";

function extractOnlineUsers(
  presenceState: Record<string, BattleRoomPresenceState[]>
): BattleRoomPresenceState[] {
  return Object.values(presenceState).map((presences) => presences[0]);
}

export function useBattleRoomPresence(
  channel: RealtimeChannel | null
) {
  const [onlineUsers, setOnlineUsers] = useState<BattleRoomPresenceState[]>([]);

  useEffect(() => {
    if (!channel) {
      setOnlineUsers([]);
      return;
    }

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<BattleRoomPresenceState>();
        setOnlineUsers(extractOnlineUsers(state));
      })
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState<BattleRoomPresenceState>();
        setOnlineUsers(extractOnlineUsers(state));
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState<BattleRoomPresenceState>();
        setOnlineUsers(extractOnlineUsers(state));
      });

    // Read current state immediately — the initial sync event may have
    // fired before these listeners were registered (race with subscribe/track)
    const currentState = channel.presenceState<BattleRoomPresenceState>();
    const currentUsers = extractOnlineUsers(currentState);
    if (currentUsers.length > 0) {
      setOnlineUsers(currentUsers);
    }
  }, [channel]);

  return { onlineUsers };
}
