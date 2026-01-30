import { LoaderIcon, PlayCircleIcon, XCircleIcon } from '@/components/Icons';
import { BASE_URL } from '@/lib/constants';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <LoaderIcon className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-3">
        <XCircleIcon className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm text-primary hover:text-primary/80 hover:underline"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

type ProcessVideoPromptProps = {
  onProcess: () => void;
};

export function ProcessVideoPrompt({ onProcess }: ProcessVideoPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-2 text-center">New Video Detected</h2>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        This video hasn't been processed yet. Generate a summary, quiz, and
        flashcards to start learning.
      </p>
      <button
        onClick={onProcess}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        <PlayCircleIcon className="w-4 h-4" />
        Process Video
      </button>
    </div>
  );
}

export function UnauthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <img
          src="/icons/icon48.png"
          alt="Retenio Logo"
          className="w-8 h-8 opacity-50"
        />
      </div>
      <h2 className="text-lg font-semibold mb-2 text-center">
        Sign in to Retenio
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Transform YouTube videos into summaries, flashcards, and quizzes for
        better learning.
      </p>
      <a
        href={`${BASE_URL}/auth/login`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
      >
        Sign In
      </a>
    </div>
  );
}

export function NotYouTubeState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-2 text-center">
        Not a YouTube Video
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Navigate to a YouTube video to see summaries, quizzes, and flashcards.
      </p>
    </div>
  );
}
