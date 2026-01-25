"use client";

import Link from "next/link";
import { Video, HelpCircle, Layers, BookOpen } from "lucide-react";
import { StudySetWithCounts } from "./ClientLibraryStudySetList";

interface LibraryStudySetCardProps {
    studySet: StudySetWithCounts;
}

export function LibraryStudySetCard({ studySet }: LibraryStudySetCardProps) {

    // Format date as "June 13, 2025"
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isVideoSourced = studySet.sourceType === "video";

    return (
        <Link
            href={`/dashboard/study-set/${studySet.publicId}`}
            className="group block p-4 rounded-lg border border-border bg-card transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-none dark:hover:border-foreground/20"
        >
            <div className="flex items-center justify-between">
                {/* Left side - Study set info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        {isVideoSourced ? (
                            <Video className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                        ) : (
                            <BookOpen className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-foreground">
                            {studySet.name}
                        </h3>
                        {studySet.description && (
                            <p className="text-sm text-muted-foreground truncate">
                                {studySet.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side - Additional info */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            {formatDate(studySet.createdAt)}
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-1">
                            <div className="flex items-center gap-1">
                                <HelpCircle className="h-4 w-4 text-muted-foreground/70" />
                                <span className="text-xs text-muted-foreground">
                                    {studySet.questionCount}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Layers className="h-4 w-4 text-muted-foreground/70" />
                                <span className="text-xs text-muted-foreground">
                                    {studySet.flashcardCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
