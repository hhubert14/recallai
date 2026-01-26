"use client";

import Link from "next/link";
import { Video, BookOpen, MoreVertical, FolderPlus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StudySetWithCounts } from "./ClientStudySetList";
import { useStudySetActions } from "./LibraryClientWrapper";

interface StudySetCardProps {
    studySet: StudySetWithCounts;
}

export function StudySetCard({ studySet }: StudySetCardProps) {
    const actions = useStudySetActions();
    const isVideoSourced = studySet.sourceType === "video";

    return (
        <div
            className="group relative p-4 rounded-lg border border-border bg-card transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-none dark:hover:border-foreground/20"
            role="article"
        >
            {/* Clickable area */}
            <Link
                href={`/dashboard/study-set/${studySet.publicId}`}
                className="block"
            >
                {/* Header with icon and title */}
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        {isVideoSourced ? (
                            <Video className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                        ) : (
                            <BookOpen className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                        <h3 className="font-medium truncate text-foreground">
                            {studySet.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {studySet.questionCount} questions · {studySet.flashcardCount} flashcards
                        </p>
                    </div>
                </div>

                {/* Description */}
                {studySet.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {studySet.description}
                    </p>
                )}
            </Link>

            {/* Actions menu - only rendered when context is available */}
            {actions && (
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
                                onSelect={() => actions.onAddToFolder(studySet)}
                            >
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Add to Folder
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
