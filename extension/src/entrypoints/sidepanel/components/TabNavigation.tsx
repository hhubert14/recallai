type Tab = 'summary' | 'quiz' | 'flashcards';

type TabNavigationProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  questionCount: number;
  flashcardCount: number;
};

export function TabNavigation({
  activeTab,
  onTabChange,
  questionCount,
  flashcardCount,
}: TabNavigationProps) {
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'quiz', label: 'Questions', count: questionCount },
    { id: 'flashcards', label: 'Cards', count: flashcardCount },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export type { Tab };
