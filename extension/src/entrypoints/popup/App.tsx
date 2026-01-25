import { useAuth } from '@/hooks/useAuth';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  YouTubeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  InfoCircleIcon,
  LoaderIcon,
} from '@/components/Icons';
import { BASE_URL } from '@/lib/constants';

export default function App() {
  const { authState } = useAuth();
  const tabState = useCurrentTab();
  const processing = useVideoProcessing();
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-[300px] p-4 font-sans bg-background text-foreground">
      <Header theme={theme} onThemeChange={setTheme} />
      <Content authState={authState} tabState={tabState} processing={processing} />
    </div>
  );
}

function Header({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <img
          src="/icons/icon48.png"
          alt="RecallAI Logo"
          className="w-7 h-7"
        />
        <h1 className="text-lg font-semibold">RecallAI</h1>
      </div>
      <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}

type TabState = ReturnType<typeof useCurrentTab>;
type ProcessingState = ReturnType<typeof useVideoProcessing>;

function Content({
  authState,
  tabState,
  processing,
}: {
  authState: 'loading' | 'authenticated' | 'unauthenticated';
  tabState: TabState;
  processing: ProcessingState;
}) {
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderIcon className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return <AuthenticatedView tabState={tabState} processing={processing} />;
  }

  return <UnauthenticatedView />;
}

function AuthenticatedView({
  tabState,
  processing,
}: {
  tabState: TabState;
  processing: ProcessingState;
}) {
  const handleSignOut = () => {
    window.open(`${BASE_URL}/auth/logout`, '_blank');
  };

  return (
    <div className="space-y-4">
      <VideoProcessingSection tabState={tabState} processing={processing} />

      <a
        href={`${BASE_URL}/dashboard`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      >
        Go to My Dashboard
        <ArrowRightIcon className="w-4 h-4" />
      </a>

      <button
        onClick={handleSignOut}
        className="w-full px-4 py-2 text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground transition-all duration-200"
      >
        Disconnect
      </button>
    </div>
  );
}

function VideoProcessingSection({
  tabState,
  processing,
}: {
  tabState: TabState;
  processing: ProcessingState;
}) {
  if (tabState.isLoading) {
    return (
      <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-center">
          <LoaderIcon className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Checking current page...
          </span>
        </div>
      </div>
    );
  }

  if (!tabState.isYouTubeVideo) {
    return (
      <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <YouTubeIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Navigate to a YouTube video to process it.
          </p>
        </div>
      </div>
    );
  }

  if (processing.status === 'idle') {
    return (
      <button
        onClick={() => tabState.url && processing.process(tabState.url)}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      >
        <PlayCircleIcon className="w-4 h-4" />
        Process Video
      </button>
    );
  }

  return (
    <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
      {processing.status === 'processing' && (
        <div className="flex items-center justify-center py-2">
          <LoaderIcon className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Processing video...
          </span>
        </div>
      )}

      {processing.status === 'success' && (
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Video processed!
            </p>
          </div>
          <a
            href={processing.studySetPublicId
              ? `${BASE_URL}/dashboard/study-set/${processing.studySetPublicId}`
              : `${BASE_URL}/dashboard`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View Study Set
            <ArrowRightIcon className="w-3 h-3" />
          </a>
        </div>
      )}

      {processing.status === 'already_exists' && (
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <InfoCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Already in your library
            </p>
          </div>
          <a
            href={processing.studySetPublicId
              ? `${BASE_URL}/dashboard/study-set/${processing.studySetPublicId}`
              : `${BASE_URL}/dashboard`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View Study Set
            <ArrowRightIcon className="w-3 h-3" />
          </a>
        </div>
      )}

      {processing.status === 'error' && (
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              {processing.errorMessage || 'Failed to process video'}
            </p>
          </div>
          <button
            onClick={() => processing.reset()}
            className="text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function UnauthenticatedView() {
  const handleSignIn = () => {
    window.open(`${BASE_URL}/auth/login`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-base font-medium mb-2">
          Transform YouTube videos into your personal learning library.
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to create summaries, flashcards, and quizzes from educational videos.
        </p>
      </div>

      <button
        onClick={handleSignIn}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      >
        Sign in to RecallAI
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
