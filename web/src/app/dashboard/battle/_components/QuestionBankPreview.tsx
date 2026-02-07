"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuestionBankPreviewProps {
  roomPublicId: string;
}

interface QuestionPreview {
  questionText: string;
  options: string[];
}

export function QuestionBankPreview({
  roomPublicId,
}: QuestionBankPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchQuestions() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/battle/rooms/${roomPublicId}/question-bank`
        );
        const data = await response.json();

        if (!response.ok || data.status === "fail") {
          setError("Failed to load questions.");
          return;
        }

        setQuestions(data.data.questions);
      } catch {
        setError("Failed to load questions.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [isOpen, roomPublicId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="size-4 mr-1" />
          Preview Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Question Bank</DialogTitle>
          <DialogDescription>
            Questions that may appear in this battle.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading questions...
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive text-center py-8">
              {error}
            </p>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No questions available.
            </p>
          )}

          {!isLoading &&
            !error &&
            questions.map((q, i) => (
              <div
                key={i}
                className="rounded-md border border-border p-3 text-sm space-y-2"
              >
                <p>
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {q.questionText}
                </p>
                {q.options.length > 0 && (
                  <ul className="ml-6 space-y-1 text-muted-foreground">
                    {q.options.map((option, j) => (
                      <li key={j}>
                        {String.fromCharCode(65 + j)}. {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
