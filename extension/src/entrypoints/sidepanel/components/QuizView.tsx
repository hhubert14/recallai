import { useState } from 'react';
import type { Question } from '@/services/api';
import { CheckCircleIcon, XCircleIcon } from '@/components/Icons';
import { StudySetLink } from './StudySetLink';

type QuizViewProps = {
  questions: Question[];
  studySetPublicId: string | null;
};

export function QuizView({ questions, studySetPublicId }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedOptionId(optionId);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionId(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOptionId(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
  };

  if (!currentQuestion) {
    return <QuizEmpty studySetPublicId={studySetPublicId} />;
  }

  const correctOption = currentQuestion.options.find((o) => o.isCorrect);
  const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="py-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentIndex
                  ? 'bg-primary'
                  : i < currentIndex
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h3 className="text-sm font-medium leading-relaxed">
          {currentQuestion.questionText}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {currentQuestion.options.map((option, index) => {
          const letter = optionLetters[index];
          const isSelected = option.id === selectedOptionId;
          const isThisCorrect = option.isCorrect;

          let buttonClass =
            'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all';

          if (showResult) {
            if (isThisCorrect) {
              buttonClass +=
                ' border-green-500 bg-green-50 dark:bg-green-950/30';
            } else if (isSelected && !isThisCorrect) {
              buttonClass +=
                ' border-red-500 bg-red-50 dark:bg-red-950/30';
            } else {
              buttonClass += ' border-border bg-card opacity-50';
            }
          } else {
            buttonClass +=
              ' border-border bg-card hover:border-primary/50 hover:bg-muted/50';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showResult}
              className={buttonClass}
            >
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  showResult && isThisCorrect
                    ? 'bg-green-500 text-white'
                    : showResult && isSelected && !isThisCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {letter}
              </span>
              <span className="text-sm flex-1">{option.optionText}</span>
              {showResult && isThisCorrect && (
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {showResult && isSelected && !isThisCorrect && (
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
          }`}
        >
          <p
            className={`text-sm font-medium mb-1 ${
              isCorrect
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          {correctOption?.explanation && (
            <p className="text-xs text-muted-foreground">
              {correctOption.explanation}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 && showResult ? (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-primary hover:text-primary/80"
          >
            Start Over
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!showResult || currentIndex === questions.length - 1}
            className="px-3 py-1.5 text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>

      {/* Link to website */}
      <StudySetLink
        studySetPublicId={studySetPublicId}
        message="Generate more questions on the website"
      />
    </div>
  );
}

export function QuizEmpty({ studySetPublicId }: { studySetPublicId: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground text-center mb-4">
        No questions available yet.
      </p>
      <StudySetLink
        studySetPublicId={studySetPublicId}
        message="Generate questions on the website"
      />
    </div>
  );
}
