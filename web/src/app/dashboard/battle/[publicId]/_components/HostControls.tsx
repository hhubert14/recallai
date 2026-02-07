import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostControlsProps {
  onStartGame: () => void;
  isStarting: boolean;
  disabled?: boolean;
  startError: string | null;
}

export function HostControls({
  onStartGame,
  isStarting,
  disabled,
  startError,
}: HostControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        onClick={onStartGame}
        disabled={disabled || isStarting}
        className="w-full sm:w-auto"
      >
        <Play className="size-4 mr-2" />
        {isStarting ? "Starting..." : "Start Game"}
      </Button>
      {startError && (
        <p className="text-sm text-destructive" role="alert">
          {startError}
        </p>
      )}
    </div>
  );
}
