import { useState } from 'react';
import type { Flashcard } from '@/services/api';
import { StudySetLink } from './StudySetLink';

type FlashcardViewProps = {
  flashcards: Flashcard[];
  studySetPublicId: string | null;
};

export function FlashcardView({ flashcards, studySetPublicId }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentCard) {
    return <FlashcardEmpty studySetPublicId={studySetPublicId} />;
  }

  return (
    <div className="py-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div className="flex gap-1">
          {flashcards.map((_, i) => (
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

      {/* Flashcard */}
      <button
        onClick={handleFlip}
        className="w-full min-h-[200px] p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
        aria-label={isFlipped ? 'Show question' : 'Show answer'}
      >
        <div className="flex flex-col h-full">
          <span
            className={`text-xs font-medium mb-2 ${
              isFlipped ? 'text-green-600 dark:text-green-400' : 'text-primary'
            }`}
          >
            {isFlipped ? 'Answer' : 'Question'}
          </span>
          <p className="text-sm leading-relaxed flex-1">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Tap to {isFlipped ? 'see question' : 'reveal answer'}
          </p>
        </div>
      </button>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentIndex === flashcards.length - 1 ? (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-primary hover:text-primary/80"
          >
            Start Over
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-sm text-primary hover:text-primary/80"
          >
            Next
          </button>
        )}
      </div>

      {/* Link to website */}
      <StudySetLink
        studySetPublicId={studySetPublicId}
        message="Generate more flashcards on the website"
      />
    </div>
  );
}

export function FlashcardEmpty({ studySetPublicId }: { studySetPublicId: string | null }) {
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground text-center mb-4">
        No flashcards available yet.
      </p>
      <StudySetLink
        studySetPublicId={studySetPublicId}
        message="Generate flashcards on the website"
      />
    </div>
  );
}
