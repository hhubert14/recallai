import { User, Bot, Lock, UserMinus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BattleSlot } from "../../_components/types";
interface SlotCardProps {
  slot: BattleSlot;
  isHost: boolean;
  isCurrentUser: boolean;
  isSlotHost?: boolean;
  isOnline?: boolean;
  onUpdateSlot?: (slotIndex: number, slotType: "bot" | "empty" | "locked") => void;
  onKickPlayer?: (slotIndex: number) => void;
}

const NEXT_SLOT_TYPE: Record<string, "bot" | "empty" | "locked"> = {
  locked: "empty",
  empty: "bot",
  bot: "locked",
};

export function SlotCard({
  slot,
  isHost,
  isCurrentUser,
  isSlotHost,
  isOnline,
  onUpdateSlot,
  onKickPlayer,
}: SlotCardProps) {
  const showToggle = isHost && slot.slotType !== "player";
  const nextType = NEXT_SLOT_TYPE[slot.slotType];

  return (
    <div className="relative rounded-lg border border-border bg-card p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
      {/* Toggle button — top-right corner */}
      {showToggle && nextType && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle slot"
          onClick={() => onUpdateSlot?.(slot.slotIndex, nextType)}
        >
          <RefreshCw className="size-4" />
        </Button>
      )}

      {/* Slot content */}
      {slot.slotType === "empty" && (
        <p className="text-sm text-muted-foreground">Waiting...</p>
      )}

      {slot.slotType === "player" && (
        <>
          <div className="relative">
            <User className="size-8 text-foreground" />
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 ring-2 ring-card" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCurrentUser && (
              <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                You
              </span>
            )}
            {isSlotHost && (
              <span className="text-xs font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
            {!isCurrentUser && !isSlotHost && (
              <span className="text-sm text-muted-foreground">Player</span>
            )}
          </div>
          {isHost && !isCurrentUser && !isSlotHost && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onKickPlayer?.(slot.slotIndex)}
            >
              <UserMinus className="size-4 mr-1" />
              Kick
            </Button>
          )}
        </>
      )}

      {slot.slotType === "bot" && (
        <>
          <Bot className="size-8 text-muted-foreground" />
          <span className="text-sm font-medium">{slot.botName}</span>
        </>
      )}

      {slot.slotType === "locked" && (
        <>
          <Lock className="size-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Locked</span>
        </>
      )}
    </div>
  );
}
