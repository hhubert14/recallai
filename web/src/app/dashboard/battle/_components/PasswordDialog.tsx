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

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function PasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
    }
  }

  return (
    <LoadingAwareDialog
      open={isOpen}
      isLoading={isLoading}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter Password</DialogTitle>
          <DialogDescription>
            This room is private. Enter the password to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="join-password">Password</Label>
              <Input
                id="join-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                disabled={isLoading}
                autoFocus
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
            <Button
              type="submit"
              disabled={!password.trim() || isLoading}
            >
              {isLoading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </LoadingAwareDialog>
  );
}
