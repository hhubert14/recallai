"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { createClient } from "./supabase/client";
import {
  LOBBY_SLOT_UPDATES_CHANNEL,
  type LobbySlotSummaryPayload,
} from "./battle-room-channel";
import type { BattleRoomSummary } from "@/app/dashboard/battle/_components/types";

interface BattleRoomsRealtimeContextType {
  rooms: BattleRoomSummary[];
  setInitialRooms: (rooms: BattleRoomSummary[]) => void;
  isConnected: boolean;
}

const BattleRoomsRealtimeContext = createContext<
  BattleRoomsRealtimeContextType | undefined
>(undefined);

// Payload type from Supabase Realtime (snake_case)
interface RealtimeBattleRoomPayload {
  id: number;
  public_id: string;
  host_user_id: string;
  study_set_id: number;
  name: string;
  visibility: string;
  status: string;
  time_limit_seconds: number;
  question_count: number;
  created_at: string;
  updated_at: string;
}

function transformPayload(
  payload: RealtimeBattleRoomPayload
): BattleRoomSummary {
  return {
    publicId: payload.public_id,
    name: payload.name,
    visibility: payload.visibility as "public" | "private",
    timeLimitSeconds: payload.time_limit_seconds,
    questionCount: payload.question_count,
    studySetName: "Unknown",
    createdAt: payload.created_at,
    slotSummary: { playerCount: 1, botCount: 0, openSlots: 0 },
  };
}

export function BattleRoomsRealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [rooms, setRooms] = useState<BattleRoomSummary[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const setInitialRooms = useCallback(
    (initialRooms: BattleRoomSummary[]) => {
      setRooms(initialRooms);
    },
    []
  );

  const handleInsert = useCallback(
    (payload: { new: RealtimeBattleRoomPayload }) => {
      if (payload.new.status !== "waiting") return;

      const newRoom = transformPayload(payload.new);

      setRooms((prev) => {
        if (prev.some((r) => r.publicId === newRoom.publicId)) {
          return prev;
        }
        return [newRoom, ...prev];
      });
    },
    []
  );

  const handleUpdate = useCallback(
    (payload: { new: RealtimeBattleRoomPayload }) => {
      if (payload.new.status !== "waiting") {
        // Room is no longer waiting — remove from lobby list
        setRooms((prev) =>
          prev.filter((r) => r.publicId !== payload.new.public_id)
        );
        return;
      }

      setRooms((prev) =>
        prev.map((r) => {
          if (r.publicId === payload.new.public_id) {
            return {
              ...r,
              name: payload.new.name,
              visibility: payload.new.visibility as "public" | "private",
              timeLimitSeconds: payload.new.time_limit_seconds,
              questionCount: payload.new.question_count,
            };
          }
          return r;
        })
      );
    },
    []
  );

  const handleDelete = useCallback(
    (payload: { old: { public_id?: string } }) => {
      if (!payload.old.public_id) return;
      setRooms((prev) =>
        prev.filter((r) => r.publicId !== payload.old.public_id)
      );
    },
    []
  );

  const handleSlotSummaryBroadcast = useCallback(
    (payload: { payload: LobbySlotSummaryPayload }) => {
      const { publicId, slotSummary } = payload.payload;
      setRooms((prev) =>
        prev.map((r) =>
          r.publicId === publicId ? { ...r, slotSummary } : r
        )
      );
    },
    []
  );

  useEffect(() => {
    const channel = supabase
      .channel("battle_rooms_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "battle_rooms",
        },
        handleInsert
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "battle_rooms",
        },
        handleUpdate
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "battle_rooms",
        },
        handleDelete
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
        }
      });

    const lobbyChannel = supabase
      .channel(LOBBY_SLOT_UPDATES_CHANNEL)
      .on("broadcast", { event: "slot_summary_updated" }, handleSlotSummaryBroadcast)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(lobbyChannel);
    };
  }, [supabase, handleInsert, handleUpdate, handleDelete, handleSlotSummaryBroadcast]);

  const value: BattleRoomsRealtimeContextType = {
    rooms,
    setInitialRooms,
    isConnected,
  };

  return (
    <BattleRoomsRealtimeContext.Provider value={value}>
      {children}
    </BattleRoomsRealtimeContext.Provider>
  );
}

export function useBattleRoomsList() {
  const context = useContext(BattleRoomsRealtimeContext);
  if (context === undefined) {
    throw new Error(
      "useBattleRoomsList must be used within a BattleRoomsRealtimeProvider"
    );
  }
  return context;
}
