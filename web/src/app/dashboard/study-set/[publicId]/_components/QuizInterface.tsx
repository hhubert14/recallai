"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AIContent } from "@/components/ui/ai-content";
import {
  QuizProgress,
  QuizQuestion,
  QuizResult,
  QuizSummary,
} from "@/components/quiz";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

type QuestionWithOptions = {
  id: number;
  videoId: number | null;
  questionText: string;
  questionType: string;
  options: {
    id: number;
    optionText: string;
    isCorrect: boolean;
    explanation: string | null;
  }[];
};

interface QuizInterfaceProps {
  questions: QuestionWithOptions[];
  videoId: number | null;
  studySetId: number;
}

function shuffleArray<T>(array: T[]): T[] {
  if (array.length <= 1) return [...array];

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleQuestionsAndOptions(
  questions: QuestionWithOptions[]
): QuestionWithOptions[] {
  const shuffledQuestions = shuffleArray(questions);
  return shuffledQuestions.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}

export function QuizInterface({
  questions,
  videoId,
  studySetId,
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<
    QuestionWithOptions[]
  >([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const { markVideoAsCompleted } = useQuizCompletion();

  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = shuffleQuestionsAndOptions(questions);
      setShuffledQuestions(shuffled);
    }
  }, [questions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion || shuffledQuestions.length === 0) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  const handleSubmit = async () => {
    if (!selectedOptionId) return;

    setIsSubmitting(true);

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) return;

    // Track correct answers
    if (selectedOption.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // Create the answer record
    await fetch("/api/v1/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        selectedOptionId: selectedOptionId,
        isCorrect: selectedOption.isCorrect,
      }),
    });

    // Initialize progress record for spaced repetition (creates if not exists)
    await fetch("/api/v1/reviews/initialize-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        isCorrect: selectedOption.isCorrect,
      }),
    });

    setShowResult(true);
    setIsSubmitting(false);

    // Mark video as completed if this is the last question (for video-sourced study sets)
    if (currentQuestionIndex === shuffledQuestions.length - 1 && videoId) {
      markVideoAsCompleted(videoId);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
    }
  };

  const handleFinish = () => {
    setSessionComplete(true);
  };

  const handleReset = () => {
    const shuffled = shuffleQuestionsAndOptions(questions);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setSessionComplete(false);
    setCorrectCount(0);
  };

  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const selectedOption = currentQuestion.options.find(
    (option) => option.id === selectedOptionId
  );

  // Session complete screen
  if (sessionComplete) {
    return (
      <QuizSummary
        correct={correctCount}
        total={shuffledQuestions.length}
        actions={[
          {
            label: "Try Again",
            onClick: handleReset,
            variant: "outline",
          },
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <QuizProgress
        current={currentQuestionIndex + 1}
        total={shuffledQuestions.length}
      />

      {/* Question */}
      <div className="space-y-4">
        <div className="bg-card p-6 rounded-xl border border-border">
          <AIContent
            content={currentQuestion.questionText}
            className="text-lg font-medium text-foreground leading-relaxed"
          />
        </div>

        {/* Options */}
        <QuizQuestion
          options={currentQuestion.options}
          selectedOptionId={selectedOptionId}
          onSelect={setSelectedOptionId}
          disabled={showResult}
          showResult={showResult}
          hideQuestionCard
        />
      </div>

      {/* Result */}
      {showResult && selectedOption && (
        <QuizResult
          isCorrect={selectedOption.isCorrect}
          explanation={
            currentQuestion.options.find((opt) => opt.isCorrect)?.explanation
          }
        />
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Checking..." : "Check Answer"}
          </Button>
        ) : (
          <>
            {!isLastQuestion ? (
              <Button onClick={handleNext} size="lg">
                Next Question →
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Finish Quiz
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
