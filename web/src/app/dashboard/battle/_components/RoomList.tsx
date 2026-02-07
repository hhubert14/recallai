import { RoomCard } from "./RoomCard";
import type { BattleRoomSummary } from "./types";

interface RoomListProps {
  rooms: BattleRoomSummary[];
  onJoinRoom: (publicId: string) => void;
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">
          No battle rooms available. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.publicId} room={room} onJoin={onJoinRoom} />
      ))}
    </div>
  );
}
