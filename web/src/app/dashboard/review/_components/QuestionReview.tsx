"use client";

import { QuizQuestion, QuizResult } from "@/components/quiz";

export interface QuestionReviewProps {
  question: {
    id: number;
    questionText: string;
    options: {
      id: number;
      optionText: string;
      isCorrect: boolean;
      explanation: string | null;
    }[];
  };
  selectedOptionId: number | null;
  onSelectOption: (optionId: number | null) => void;
  showResult: boolean;
}

export function QuestionReview({
  question,
  selectedOptionId,
  onSelectOption,
  showResult,
}: QuestionReviewProps) {
  const selectedOption = question.options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <>
      {/* Question */}
      <QuizQuestion
        questionText={question.questionText}
        options={question.options}
        selectedOptionId={selectedOptionId}
        onSelect={onSelectOption}
        disabled={showResult}
        showResult={showResult}
      />

      {/* Result feedback */}
      {showResult && selectedOption && (
        <QuizResult
          isCorrect={selectedOption.isCorrect}
          explanation={
            question.options.find((opt) => opt.isCorrect)?.explanation
          }
        />
      )}
    </>
  );
}
