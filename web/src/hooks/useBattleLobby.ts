"use client";

import { useState } from "react";
import type { BattleSlot } from "@/app/dashboard/battle/_components/types";

interface CreateRoomInput {
  studySetPublicId: string;
  name: string;
  visibility: "public" | "private";
  password?: string;
  timeLimitSeconds: number;
  questionCount: number;
}

export function useBattleLobby() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom(
    input: CreateRoomInput
  ): Promise<string | undefined> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/battle/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to create room");
        return undefined;
      }

      return data.data.room.publicId;
    } catch {
      setError("An error occurred. Please try again.");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }

  async function joinRoom(
    publicId: string,
    password?: string
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = {};
      if (password) {
        body.password = password;
      }

      const response = await fetch(
        `/api/v1/battle/rooms/${publicId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to join room");
        return false;
      }

      return true;
    } catch {
      setError("An error occurred. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function leaveRoom(publicId: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/battle/rooms/${publicId}/leave`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to leave room");
        return false;
      }

      return true;
    } catch {
      setError("An error occurred. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSlot(
    publicId: string,
    slotIndex: number,
    slotType: "bot" | "empty" | "locked"
  ): Promise<BattleSlot | undefined> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/battle/rooms/${publicId}/slots/${slotIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", slotType }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to update slot");
        return undefined;
      }

      return data.data.slot;
    } catch {
      setError("An error occurred. Please try again.");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }

  async function kickPlayer(
    publicId: string,
    slotIndex: number
  ): Promise<BattleSlot | undefined> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/battle/rooms/${publicId}/slots/${slotIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "kick" }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to kick player");
        return undefined;
      }

      return data.data.slot;
    } catch {
      setError("An error occurred. Please try again.");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }

  async function startGame(publicId: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/battle/rooms/${publicId}/start`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to start game");
        return false;
      }

      return true;
    } catch {
      setError("An error occurred. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateSlot,
    kickPlayer,
    startGame,
  };
}
