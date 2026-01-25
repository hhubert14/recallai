"use client";

import { StudySetSourceType } from "@/clean-architecture/domain/entities/study-set.entity";
import { LibraryStudySetCard } from "./LibraryStudySetCard";
import { useInView } from "@/hooks/useInView";

export interface StudySetWithCounts {
    id: number;
    publicId: string;
    name: string;
    description: string | null;
    sourceType: StudySetSourceType;
    createdAt: string;
    questionCount: number;
    flashcardCount: number;
}

interface ClientLibraryStudySetListProps {
    studySets: StudySetWithCounts[];
}

export function ClientLibraryStudySetList({
    studySets,
}: ClientLibraryStudySetListProps) {
    const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    return (
        <div ref={ref} className="space-y-3">
            {studySets.map((studySet, index) => (
                <div
                    key={studySet.id}
                    className={`opacity-0 ${isInView ? "animate-fade-up" : ""}`}
                    style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: "forwards",
                    }}
                >
                    <LibraryStudySetCard studySet={studySet} />
                </div>
            ))}
        </div>
    );
}
