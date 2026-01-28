import { useState } from 'react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoaderIcon } from '@/components/Icons';
import { useSidePanel } from '@/hooks/useSidePanel';
import {
  TabNavigation,
  SummaryView,
  SummaryEmpty,
  QuizView,
  QuizEmpty,
  FlashcardView,
  FlashcardEmpty,
  LoadingState,
  ErrorState,
  ProcessVideoPrompt,
  UnauthenticatedState,
  NotYouTubeState,
  type Tab,
} from './components';

export default function App() {
  const { theme, setTheme, mounted } = useTheme();
  const sidePanel = useSidePanel();
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  // Wait for theme to be mounted before rendering to avoid flash
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoaderIcon className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        title={sidePanel.videoTitle}
      />
      <Content
        sidePanel={sidePanel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

function Header({
  theme,
  onThemeChange,
  title,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  title: string | null;
}) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src="/icons/icon48.png"
            alt="RecallAI Logo"
            className="w-6 h-6 shrink-0"
          />
          {title ? (
            <h1
              className="text-sm font-medium truncate"
              title={title}
            >
              {title}
            </h1>
          ) : (
            <h1 className="text-base font-semibold">RecallAI</h1>
          )}
        </div>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  );
}

type SidePanelState = ReturnType<typeof useSidePanel>;

function Content({
  sidePanel,
  activeTab,
  onTabChange,
}: {
  sidePanel: SidePanelState;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const { status, content, error } = sidePanel;

  if (status === 'loading') {
    return <LoadingState message="Loading..." />;
  }

  if (status === 'unauthenticated') {
    return <UnauthenticatedState />;
  }

  if (status === 'not_youtube') {
    return <NotYouTubeState />;
  }

  if (status === 'error') {
    return <ErrorState message={error || undefined} onRetry={sidePanel.refetch} />;
  }

  if (status === 'processing') {
    return <LoadingState message="Processing video..." />;
  }

  if (status === 'not_processed') {
    return (
      <ProcessVideoPrompt
        onProcess={sidePanel.processVideo}
        isProcessing={false}
      />
    );
  }

  // Ready state - show content
  if (status === 'ready' && content) {
    const questionCount = content.questions.length;
    const flashcardCount = content.flashcards.length;

    return (
      <>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          questionCount={questionCount}
          flashcardCount={flashcardCount}
        />
        <main className="flex-1 overflow-y-auto px-4">
          <TabContent
            activeTab={activeTab}
            content={content}
            videoUrl={sidePanel.videoUrl}
          />
        </main>
      </>
    );
  }

  // Fallback
  return <LoadingState />;
}

function TabContent({
  activeTab,
  content,
  videoUrl,
}: {
  activeTab: Tab;
  content: NonNullable<SidePanelState['content']>;
  videoUrl: string | null;
}) {
  const studySetPublicId = content.studySet?.publicId ?? null;

  switch (activeTab) {
    case 'summary':
      return content.summary ? (
        <SummaryView content={content.summary.content} videoUrl={videoUrl} />
      ) : (
        <SummaryEmpty />
      );

    case 'quiz':
      return content.questions.length > 0 ? (
        <QuizView questions={content.questions} studySetPublicId={studySetPublicId} />
      ) : (
        <QuizEmpty studySetPublicId={studySetPublicId} />
      );

    case 'flashcards':
      return content.flashcards.length > 0 ? (
        <FlashcardView flashcards={content.flashcards} studySetPublicId={studySetPublicId} />
      ) : (
        <FlashcardEmpty studySetPublicId={studySetPublicId} />
      );

    default:
      return null;
  }
}
