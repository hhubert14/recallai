"use client";

import { Plus, Folder as FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderCard } from "./FolderCard";

interface FolderData {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  studySetCount: number;
}

interface FoldersViewProps {
  folders: FolderData[];
  onFolderClick: (folder: FolderData) => void;
  onCreateClick?: () => void;
  onEditFolder?: (folder: FolderData) => void;
  onDeleteFolder?: (folder: FolderData) => void;
}

export function FoldersView({
  folders,
  onFolderClick,
  onCreateClick,
  onEditFolder,
  onDeleteFolder,
}: FoldersViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      {folders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No folders yet. Create one to organize your study sets.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              studySetCount={folder.studySetCount}
              onClick={() => onFolderClick(folder)}
              onEdit={() => onEditFolder?.(folder)}
              onDelete={() => onDeleteFolder?.(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
