"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudySetSourceType } from "@/clean-architecture/domain/entities/study-set.entity";

export interface StudySetData {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  sourceType: StudySetSourceType;
  videoId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateStudySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studySet: StudySetData) => void;
}

export function CreateStudySetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStudySetModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/study-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to create study set");
        setIsLoading(false);
        return;
      }

      onSuccess(data.data.studySet);
      onClose();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !isLoading;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isLoading) return;
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Study Set</DialogTitle>
          <DialogDescription>
            Create a new study set to organize your flashcards and questions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="study-set-name">Name</Label>
              <Input
                id="study-set-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter study set name"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-set-description">Description</Label>
              <Input
                id="study-set-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
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
    </Dialog>
  );
}
