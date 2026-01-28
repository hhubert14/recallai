import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardView, FlashcardEmpty } from './FlashcardView';
import { createMockFlashcard, resetFactoryCounters } from '@/test/factories/study-set.factory';

describe('FlashcardView', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  describe('empty state', () => {
    it('renders empty state when flashcards array is empty', () => {
      render(<FlashcardView flashcards={[]} studySetPublicId="test-id" />);

      expect(screen.getByText('No flashcards available yet.')).toBeInTheDocument();
    });
  });

  describe('initial card display', () => {
    it('displays the first flashcard front by default', () => {
      const flashcards = [
        createMockFlashcard({ front: 'What is React?', back: 'A JavaScript library' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.queryByText('A JavaScript library')).not.toBeInTheDocument();
    });

    it('shows "Question" label when displaying front', () => {
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByText('Question')).toBeInTheDocument();
    });

    it('shows tap hint for revealing answer', () => {
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByText('Tap to reveal answer')).toBeInTheDocument();
    });
  });

  describe('flip interaction', () => {
    it('reveals answer when card is clicked', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Question text', back: 'Answer text' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      const card = screen.getByRole('button', { name: /show answer/i });
      await user.click(card);

      expect(screen.getByText('Answer text')).toBeInTheDocument();
      expect(screen.queryByText('Question text')).not.toBeInTheDocument();
    });

    it('shows "Answer" label when flipped', async () => {
      const user = userEvent.setup();
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      const card = screen.getByRole('button', { name: /show answer/i });
      await user.click(card);

      expect(screen.getByText('Answer')).toBeInTheDocument();
    });

    it('shows tap hint for seeing question when flipped', async () => {
      const user = userEvent.setup();
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      const card = screen.getByRole('button', { name: /show answer/i });
      await user.click(card);

      expect(screen.getByText('Tap to see question')).toBeInTheDocument();
    });

    it('flips back to question when clicked again', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Question text', back: 'Answer text' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      const card = screen.getByRole('button', { name: /show answer/i });
      await user.click(card);

      expect(screen.getByText('Answer text')).toBeInTheDocument();

      const flippedCard = screen.getByRole('button', { name: /show question/i });
      await user.click(flippedCard);

      expect(screen.getByText('Question text')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to next card when Next is clicked', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Card 1 front' }),
        createMockFlashcard({ front: 'Card 2 front' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByText('Card 1 front')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText('Card 2 front')).toBeInTheDocument();
    });

    it('navigates to previous card when Previous is clicked', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Card 1 front' }),
        createMockFlashcard({ front: 'Card 2 front' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText('Card 2 front')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /previous/i }));
      expect(screen.getByText('Card 1 front')).toBeInTheDocument();
    });

    it('disables Previous button on first card', () => {
      const flashcards = [createMockFlashcard(), createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();
    });

    it('shows Start Over button on last card', async () => {
      const user = userEvent.setup();
      const flashcards = [createMockFlashcard(), createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
    });

    it('resets to first card when Start Over is clicked', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Card 1 front' }),
        createMockFlashcard({ front: 'Card 2 front' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText('Card 2 front')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /start over/i }));
      expect(screen.getByText('Card 1 front')).toBeInTheDocument();
    });

    it('resets flip state when navigating to next card', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Card 1 front', back: 'Card 1 back' }),
        createMockFlashcard({ front: 'Card 2 front', back: 'Card 2 back' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      // Flip first card
      await user.click(screen.getByRole('button', { name: /show answer/i }));
      expect(screen.getByText('Card 1 back')).toBeInTheDocument();

      // Navigate to next card
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should show front of next card
      expect(screen.getByText('Card 2 front')).toBeInTheDocument();
      expect(screen.getByText('Question')).toBeInTheDocument();
    });

    it('resets flip state when navigating to previous card', async () => {
      const user = userEvent.setup();
      const flashcards = [
        createMockFlashcard({ front: 'Card 1 front', back: 'Card 1 back' }),
        createMockFlashcard({ front: 'Card 2 front', back: 'Card 2 back' }),
      ];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      // Go to second card and flip it
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByRole('button', { name: /show answer/i }));
      expect(screen.getByText('Card 2 back')).toBeInTheDocument();

      // Navigate back
      await user.click(screen.getByRole('button', { name: /previous/i }));

      // Should show front of previous card
      expect(screen.getByText('Card 1 front')).toBeInTheDocument();
    });
  });

  describe('progress indicator', () => {
    it('shows current card number and total', () => {
      const flashcards = [createMockFlashcard(), createMockFlashcard(), createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
    });

    it('updates progress when navigating', async () => {
      const user = userEvent.setup();
      const flashcards = [createMockFlashcard(), createMockFlashcard(), createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
    });

    it('resets progress when starting over', async () => {
      const user = userEvent.setup();
      const flashcards = [createMockFlashcard(), createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText('Card 2 of 2')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /start over/i }));
      expect(screen.getByText('Card 1 of 2')).toBeInTheDocument();
    });
  });

  describe('study set link', () => {
    it('shows link to website when studySetPublicId is provided', () => {
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId="test-id" />);

      expect(screen.getByRole('link', { name: /generate more flashcards/i })).toBeInTheDocument();
    });

    it('does not show link when studySetPublicId is null', () => {
      const flashcards = [createMockFlashcard()];

      render(<FlashcardView flashcards={flashcards} studySetPublicId={null} />);

      expect(screen.queryByRole('link', { name: /generate more flashcards/i })).not.toBeInTheDocument();
    });
  });
});

describe('FlashcardEmpty', () => {
  it('renders empty state message', () => {
    render(<FlashcardEmpty studySetPublicId="test-id" />);

    expect(screen.getByText('No flashcards available yet.')).toBeInTheDocument();
  });

  it('shows link to generate flashcards when studySetPublicId provided', () => {
    render(<FlashcardEmpty studySetPublicId="test-id" />);

    expect(screen.getByRole('link', { name: /generate flashcards on the website/i })).toBeInTheDocument();
  });

  it('does not show link when studySetPublicId is null', () => {
    render(<FlashcardEmpty studySetPublicId={null} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
