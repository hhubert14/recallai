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

interface FolderData {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EditFolderModalProps {
  isOpen: boolean;
  folder: FolderData;
  onClose: () => void;
  onSuccess: (folder: FolderData) => void;
  onDelete: (folderId: number) => void;
}

export function EditFolderModal({
  isOpen,
  folder,
  onClose,
  onSuccess,
  onDelete,
}: EditFolderModalProps) {
  const [name, setName] = useState(folder.name);
  const [description, setDescription] = useState(folder.description ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when folder changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(folder.name);
      setDescription(folder.description ?? "");
      setError(null);
      setIsLoading(false);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/folders/${folder.id}`, {
        method: "PATCH",
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
        setError(data.data?.error || "Failed to update folder");
        setIsLoading(false);
        return;
      }

      onSuccess(data.data.folder);
      onClose();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/folders/${folder.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        setError(data.data?.error || "Failed to delete folder");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      onDelete(folder.id);
      onClose();
    } catch {
      setError("An error occurred. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !isLoading && !isDeleting;

  if (showDeleteConfirm) {
    return (
      <LoadingAwareDialog
        open={isOpen}
        isLoading={isLoading || isDeleting}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this folder? Study sets in this
              folder will not be deleted.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </LoadingAwareDialog>
    );
  }

  return (
    <LoadingAwareDialog
      open={isOpen}
      isLoading={isLoading || isDeleting}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>Update your folder details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Name</Label>
              <Input
                id="edit-folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                disabled={isLoading || isDeleting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-folder-description">Description</Label>
              <Input
                id="edit-folder-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                disabled={isLoading || isDeleting}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}
              className="mr-auto"
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </LoadingAwareDialog>
  );
}
