"use client";

import { StudySetSourceType } from "@/clean-architecture/domain/entities/study-set.entity";
import { StudySetCard } from "./StudySetCard";
import { useInView } from "@/hooks/useInView";
import {
  BookOpen,
  ArrowRight,
  Plus,
  FolderPlus,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

interface ClientStudySetListProps {
  studySets: StudySetWithCounts[];
  isViewingFolder?: boolean;
  onCreateStudySet?: () => void;
}

export function ClientStudySetList({
  studySets,
  isViewingFolder = false,
  onCreateStudySet,
}: ClientStudySetListProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const router = useRouter();

  if (studySets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          {isViewingFolder ? (
            <FolderPlus className="w-6 h-6 text-primary" />
          ) : (
            <BookOpen className="w-6 h-6 text-primary" />
          )}
        </div>
        {isViewingFolder ? (
          <>
            <p className="text-sm font-medium mb-2">This folder is empty</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add study sets from your library using the{" "}
              <MoreVertical className="inline h-3 w-3 mx-1" /> menu
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/library")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Library
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              No study sets yet. Create your own or install the Chrome extension
              to generate study sets from YouTube videos.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {onCreateStudySet && (
                <Button size="sm" onClick={onCreateStudySet}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create Study Set
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="group">
                <a
                  href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Chrome Extension
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {studySets.map((studySet, index) => (
        <div
          key={studySet.id}
          className={`min-w-0 opacity-0 ${isInView ? "animate-fade-up" : ""}`}
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: "forwards",
          }}
        >
          <StudySetCard studySet={studySet} />
        </div>
      ))}
    </div>
  );
}
