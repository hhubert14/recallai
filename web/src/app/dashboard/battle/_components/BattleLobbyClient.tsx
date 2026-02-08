"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBattleLobby } from "@/hooks/useBattleLobby";
import { useBattleRoomsList } from "@/lib/battle-rooms-realtime-provider";
import { RoomList } from "./RoomList";
import { CreateRoomModal } from "./CreateRoomModal";
import { PasswordDialog } from "./PasswordDialog";
import type { BattleRoomSummary, StudySetForBattle } from "./types";

interface BattleLobbyClientProps {
  initialRooms: BattleRoomSummary[];
  studySets: StudySetForBattle[];
}

export function BattleLobbyClient({
  initialRooms,
  studySets,
}: BattleLobbyClientProps) {
  const router = useRouter();
  const { joinRoom, isLoading, error } = useBattleLobby();
  const { rooms, setInitialRooms } = useBattleRoomsList();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [passwordRoom, setPasswordRoom] = useState<string | null>(null);

  useEffect(() => {
    setInitialRooms(initialRooms);
  }, [initialRooms, setInitialRooms]);

  function handleJoinRoom(publicId: string) {
    const room = rooms.find((r) => r.publicId === publicId);
    if (room?.visibility === "private") {
      setPasswordRoom(publicId);
    } else {
      handleJoinPublic(publicId);
    }
  }

  async function handleJoinPublic(publicId: string) {
    const success = await joinRoom(publicId);
    if (success) {
      router.push(`/dashboard/battle/${publicId}`);
    }
  }

  async function handleJoinWithPassword(password: string) {
    if (!passwordRoom) return;
    const success = await joinRoom(passwordRoom, password);
    if (success) {
      setPasswordRoom(null);
      router.push(`/dashboard/battle/${passwordRoom}`);
    }
  }

  function handleCreateSuccess(publicId: string) {
    router.push(`/dashboard/battle/${publicId}`);
  }

  function handleJoinRandom() {
    const publicRooms = rooms.filter(
      (r) => r.visibility === "public" && r.slotSummary.openSlots > 0
    );
    if (publicRooms.length === 0) return;
    const randomRoom =
      publicRooms[Math.floor(Math.random() * publicRooms.length)];
    handleJoinPublic(randomRoom.publicId);
  }

  const hasPublicOpenRooms = rooms.some(
    (r) => r.visibility === "public" && r.slotSummary.openSlots > 0
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-6">
        <Button
          variant="outline"
          onClick={handleJoinRandom}
          disabled={!hasPublicOpenRooms || isLoading}
          className="w-full sm:w-auto"
        >
          <Shuffle className="size-4 mr-2" />
          Join Random
        </Button>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="size-4 mr-2" />
          Create Room
        </Button>
      </div>

      <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        studySets={studySets}
      />

      <PasswordDialog
        isOpen={passwordRoom !== null}
        onClose={() => setPasswordRoom(null)}
        onSubmit={handleJoinWithPassword}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
