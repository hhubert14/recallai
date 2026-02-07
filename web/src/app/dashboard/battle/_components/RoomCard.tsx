import { Lock, Users, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BattleRoomSummary } from "./types";

interface RoomCardProps {
  room: BattleRoomSummary;
  onJoin: (publicId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const { slotSummary } = room;
  const totalOccupied = slotSummary.playerCount + slotSummary.botCount;
  const totalCapacity = totalOccupied + slotSummary.openSlots;
  const isFull = slotSummary.openSlots === 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {room.name}
            </h3>
            {room.visibility === "private" && (
              <Lock
                className="size-4 text-muted-foreground shrink-0"
                aria-label="Private room"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {room.studySetName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-4" />
          {totalOccupied}/{totalCapacity}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-4" />
          {room.timeLimitSeconds}s
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="size-4" />
          {room.questionCount} Qs
        </span>
      </div>

      <Button
        size="sm"
        className="w-full sm:w-auto self-end"
        onClick={() => onJoin(room.publicId)}
        disabled={isFull}
      >
        {isFull ? "Full" : "Join"}
      </Button>
    </div>
  );
}
