"use client";

import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FolderData {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FolderCardProps {
  folder: FolderData;
  studySetCount: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FolderCard({
  folder,
  studySetCount,
  onClick,
  onEdit,
  onDelete,
}: FolderCardProps) {
  const studySetText = studySetCount === 1 ? "study set" : "study sets";

  return (
    <div
      className="group relative p-4 rounded-lg border border-border bg-card transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-none dark:hover:border-foreground/20"
      role="article"
    >
      {/* Clickable area */}
      <button
        type="button"
        className="w-full text-left cursor-pointer"
        onClick={onClick}
        aria-label={`Open folder ${folder.name}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Folder className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate text-foreground">
              {folder.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {studySetCount} {studySetText}
            </p>
          </div>
        </div>
        {folder.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {folder.description}
          </p>
        )}
      </button>

      {/* Actions menu */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
