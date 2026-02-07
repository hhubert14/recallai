"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingAwareDialog } from "@/components/ui/loading-aware-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBattleLobby } from "@/hooks/useBattleLobby";
import type { StudySetForBattle } from "./types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (publicId: string) => void;
  studySets: StudySetForBattle[];
}

const TIME_LIMITS = [10, 15, 20, 30];
const QUESTION_COUNTS = [5, 10, 15, 20];

export function CreateRoomModal({
  isOpen,
  onClose,
  onSuccess,
  studySets,
}: CreateRoomModalProps) {
  const [selectedStudySetPublicId, setSelectedStudySetPublicId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [password, setPassword] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("15");
  const [questionCount, setQuestionCount] = useState("10");
  const [formError, setFormError] = useState<string | null>(null);

  const { createRoom, isLoading, error } = useBattleLobby();

  const eligibleStudySets = studySets.filter((s) => s.questionCount >= 5);
  const selectedStudySet = eligibleStudySets.find(
    (s) => s.publicId === selectedStudySetPublicId
  );

  // Cap question count options based on selected study set
  const maxQuestions = selectedStudySet?.questionCount ?? 0;
  const availableQuestionCounts = QUESTION_COUNTS.filter(
    (c) => c <= maxQuestions
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStudySetPublicId("");
      setRoomName("");
      setVisibility("public");
      setPassword("");
      setTimeLimitSeconds("15");
      setQuestionCount("10");
      setFormError(null);
    }
  }, [isOpen]);

  // Auto-adjust question count when study set changes
  useEffect(() => {
    if (selectedStudySet) {
      const currentCount = parseInt(questionCount, 10);
      if (currentCount > selectedStudySet.questionCount) {
        const bestFit =
          availableQuestionCounts[availableQuestionCounts.length - 1];
        if (bestFit) {
          setQuestionCount(String(bestFit));
        }
      }
    }
  }, [selectedStudySetPublicId]);

  function handleStudySetChange(publicId: string) {
    setSelectedStudySetPublicId(publicId);
    const set = eligibleStudySets.find((s) => s.publicId === publicId);
    if (set && !roomName) {
      setRoomName(set.name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedStudySetPublicId) {
      setFormError("Please select a study set.");
      return;
    }

    if (!roomName.trim()) {
      setFormError("Please enter a room name.");
      return;
    }

    if (visibility === "private" && !password.trim()) {
      setFormError("Please enter a password for private rooms.");
      return;
    }

    const publicId = await createRoom({
      studySetPublicId: selectedStudySetPublicId,
      name: roomName.trim(),
      visibility,
      password: visibility === "private" ? password.trim() : undefined,
      timeLimitSeconds: parseInt(timeLimitSeconds, 10),
      questionCount: parseInt(questionCount, 10),
    });

    if (publicId) {
      onSuccess(publicId);
      onClose();
    }
  }

  const canSubmit =
    selectedStudySetPublicId &&
    roomName.trim().length > 0 &&
    (visibility === "public" || password.trim().length > 0) &&
    !isLoading;

  return (
    <LoadingAwareDialog
      open={isOpen}
      isLoading={isLoading}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Battle Room</DialogTitle>
          <DialogDescription>
            Set up a new battle room and invite others to compete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-hidden">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="study-set-select">Study Set</Label>
              <Select
                value={selectedStudySetPublicId}
                onValueChange={handleStudySetChange}
                disabled={isLoading}
              >
                <SelectTrigger id="study-set-select" aria-label="Study Set">
                  <SelectValue placeholder="Choose a study set" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-w-[var(--radix-select-trigger-width)]">
                  {eligibleStudySets.map((set) => (
                    <SelectItem key={set.publicId} value={set.publicId}>
                      {set.name} ({set.questionCount} questions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(v) => setVisibility(v as "public" | "private")}
                className="flex gap-4"
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="public" id="visibility-public" />
                  <Label htmlFor="visibility-public">Public</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="private" id="visibility-private" />
                  <Label htmlFor="visibility-private">Private</Label>
                </div>
              </RadioGroup>
            </div>

            {visibility === "private" && (
              <div className="space-y-2">
                <Label htmlFor="room-password">Password</Label>
                <Input
                  id="room-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter room password"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time per Question</Label>
                <Select
                  value={timeLimitSeconds}
                  onValueChange={setTimeLimitSeconds}
                  disabled={isLoading}
                >
                  <SelectTrigger id="time-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_LIMITS.map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} seconds
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-count">Questions</Label>
                <Select
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  disabled={isLoading || !selectedStudySetPublicId}
                >
                  <SelectTrigger id="question-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestionCounts.map((c) => (
                      <SelectItem key={c} value={String(c)}>
                        {c} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formError || error) && (
              <p className="text-sm text-destructive" role="alert">
                {formError || error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </LoadingAwareDialog>
  );
}
