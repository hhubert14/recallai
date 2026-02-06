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
import { Folder } from "lucide-react";

export interface FolderOption {
  id: number;
  name: string;
  isChecked: boolean;
}

interface AddToFolderModalProps {
  isOpen: boolean;
  studySetName: string;
  folders: FolderOption[];
  onClose: () => void;
  onSave: (folderIds: number[]) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function AddToFolderModal({
  isOpen,
  studySetName,
  folders,
  onClose,
  onSave,
  isLoading,
  error,
}: AddToFolderModalProps) {
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(
    new Set()
  );

  // Initialize/update selection when folders change
  useEffect(() => {
    const initialSelection = new Set(
      folders.filter((f) => f.isChecked).map((f) => f.id)
    );
    setSelectedFolderIds(initialSelection);
  }, [folders]);

  const handleToggle = (folderId: number) => {
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    // Sort IDs to ensure consistent ordering
    const sortedIds = Array.from(selectedFolderIds).sort((a, b) => a - b);
    await onSave(sortedIds);
  };

  const hasNoFolders = folders.length === 0;

  return (
    <LoadingAwareDialog
      open={isOpen}
      isLoading={isLoading}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Select folders for{" "}
            <span className="font-medium">{studySetName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {hasNoFolders ? (
            <div className="text-center text-muted-foreground py-8">
              <Folder className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No folders available.</p>
              <p className="text-sm mt-1">
                Create a folder first to organize your study sets.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.map((folder) => (
                <label
                  key={folder.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFolderIds.has(folder.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFolderIds.has(folder.id)}
                    onChange={() => handleToggle(folder.id)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    aria-label={folder.name}
                  />
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{folder.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || hasNoFolders}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </LoadingAwareDialog>
  );
}
