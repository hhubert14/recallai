import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizView, QuizEmpty } from './QuizView';
import {
  createMockQuestion,
  createMockQuestionOption,
  resetFactoryCounters,
} from '@/test/factories/study-set.factory';

describe('QuizView', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  describe('empty state', () => {
    it('renders empty state when questions array is empty', () => {
      render(<QuizView questions={[]} studySetPublicId="test-id" />);

      expect(screen.getByText('No questions available yet.')).toBeInTheDocument();
    });
  });

  describe('question and options display', () => {
    it('displays the question text', () => {
      const questions = [
        createMockQuestion({ questionText: 'What is the capital of France?' }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    });

    it('displays all options with letters', () => {
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Paris', isCorrect: true }),
            createMockQuestionOption({ optionText: 'London' }),
            createMockQuestionOption({ optionText: 'Berlin' }),
            createMockQuestionOption({ optionText: 'Madrid' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Berlin')).toBeInTheDocument();
      expect(screen.getByText('Madrid')).toBeInTheDocument();

      // Check letter labels exist
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('enables all option buttons initially', () => {
      const questions = [createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      const buttons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Option')
      );
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('option selection and feedback', () => {
    it('shows correct feedback when selecting correct answer', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Correct Answer', isCorrect: true, explanation: 'This is why it is correct.' }),
            createMockQuestionOption({ optionText: 'Wrong Answer' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Correct Answer'));

      expect(screen.getByText('Correct!')).toBeInTheDocument();
      expect(screen.getByText('This is why it is correct.')).toBeInTheDocument();
    });

    it('shows incorrect feedback when selecting wrong answer', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Correct Answer', isCorrect: true, explanation: 'This is the explanation.' }),
            createMockQuestionOption({ optionText: 'Wrong Answer' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Wrong Answer'));

      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      // Should still show explanation for the correct answer
      expect(screen.getByText('This is the explanation.')).toBeInTheDocument();
    });

    it('disables all options after selection', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Option 1', isCorrect: true }),
            createMockQuestionOption({ optionText: 'Option 2' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option 1'));

      const buttons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Option')
      );
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('prevents multiple selections', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Option 1', isCorrect: true }),
            createMockQuestionOption({ optionText: 'Option 2' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option 1'));
      await user.click(screen.getByText('Option 2'));

      // Should still show correct feedback for first selection
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    it('highlights correct answer visually', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({
          options: [
            createMockQuestionOption({ optionText: 'Correct', isCorrect: true }),
            createMockQuestionOption({ optionText: 'Wrong' }),
          ],
        }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Wrong'));

      // The correct answer should have a check icon (SVG element)
      const correctButton = screen.getByText('Correct').closest('button');
      expect(correctButton).toBeInTheDocument();
      expect(correctButton!.querySelector('svg')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('enables Next button after answering', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion(),
        createMockQuestion(),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      await user.click(screen.getByText('Option A'));

      expect(nextButton).not.toBeDisabled();
    });

    it('navigates to next question when Next is clicked', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({ questionText: 'Question 1?' }),
        createMockQuestion({ questionText: 'Question 2?' }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });

    it('resets selection state when navigating to next question', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion(),
        createMockQuestion(),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      expect(screen.getByText('Correct!')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Feedback should be cleared
      expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
      expect(screen.queryByText('Incorrect')).not.toBeInTheDocument();

      // Options should be enabled again
      const buttons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('Option')
      );
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('navigates to previous question when Previous is clicked', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({ questionText: 'Question 1?' }),
        createMockQuestion({ questionText: 'Question 2?' }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText('Question 2?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /previous/i }));

      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    it('disables Previous button on first question', () => {
      const questions = [createMockQuestion(), createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    it('shows Start Over button on last question after answering', async () => {
      const user = userEvent.setup();
      const questions = [createMockQuestion(), createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      // Answer first question
      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Answer last question
      await user.click(screen.getByText('Option A'));

      expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument();
    });

    it('does not show Start Over before answering last question', async () => {
      const user = userEvent.setup();
      const questions = [createMockQuestion(), createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Before answering last question
      expect(screen.queryByRole('button', { name: /start over/i })).not.toBeInTheDocument();
    });

    it('resets to first question when Start Over is clicked', async () => {
      const user = userEvent.setup();
      const questions = [
        createMockQuestion({ questionText: 'Question 1?' }),
        createMockQuestion({ questionText: 'Question 2?' }),
      ];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /start over/i }));

      expect(screen.getByText('Question 1?')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });
  });

  describe('progress indicator', () => {
    it('shows current question number and total', () => {
      const questions = [createMockQuestion(), createMockQuestion(), createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });

    it('updates progress when navigating', async () => {
      const user = userEvent.setup();
      const questions = [createMockQuestion(), createMockQuestion(), createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      await user.click(screen.getByText('Option A'));
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    });
  });

  describe('study set link', () => {
    it('shows link to website when studySetPublicId is provided', () => {
      const questions = [createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId="test-id" />);

      expect(screen.getByRole('link', { name: /generate more questions/i })).toBeInTheDocument();
    });

    it('does not show link when studySetPublicId is null', () => {
      const questions = [createMockQuestion()];

      render(<QuizView questions={questions} studySetPublicId={null} />);

      expect(screen.queryByRole('link', { name: /generate more questions/i })).not.toBeInTheDocument();
    });
  });
});

describe('QuizEmpty', () => {
  it('renders empty state message', () => {
    render(<QuizEmpty studySetPublicId="test-id" />);

    expect(screen.getByText('No questions available yet.')).toBeInTheDocument();
  });

  it('shows link to generate questions when studySetPublicId provided', () => {
    render(<QuizEmpty studySetPublicId="test-id" />);

    expect(screen.getByRole('link', { name: /generate questions on the website/i })).toBeInTheDocument();
  });

  it('does not show link when studySetPublicId is null', () => {
    render(<QuizEmpty studySetPublicId={null} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
