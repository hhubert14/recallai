type SummaryViewProps = {
  content: string;
  videoUrl: string | null;
};

// Timestamp regex: matches 0:30, 1:23, 12:34, 1:23:45, etc.
const TIMESTAMP_REGEX = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;

/**
 * Navigate the current tab to the given URL
 */
async function navigateToTimestamp(url: string) {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.update(tabs[0].id, { url });
    }
  } catch (error) {
    console.error('Failed to navigate to timestamp:', error);
  }
}

/**
 * Convert timestamp string to seconds
 * "1:23" -> 83, "1:23:45" -> 5025
 */
function timestampToSeconds(match: string): number {
  const parts = match.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
}

/**
 * Build YouTube URL with timestamp
 */
function buildTimestampUrl(videoUrl: string, seconds: number): string {
  try {
    const url = new URL(videoUrl);
    url.searchParams.set('t', String(seconds));
    return url.toString();
  } catch (error) {
    console.warn('Failed to build timestamp URL:', error, videoUrl);
    return videoUrl;
  }
}

export function SummaryView({ content, videoUrl }: SummaryViewProps) {
  // Simple markdown-like rendering for the summary
  // Supports: headings, paragraphs, bullet points, bold, timestamps
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-3">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // Heading 2 (##)
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={i} className="text-base font-semibold mb-2 mt-4 first:mt-0">
            {renderInlineText(line.slice(3))}
          </h2>
        );
        continue;
      }

      // Heading 3 (###)
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={i} className="text-sm font-semibold mb-1.5 mt-3">
            {renderInlineText(line.slice(4))}
          </h3>
        );
        continue;
      }

      // Bullet point
      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentList.push(line.slice(2));
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
          {renderInlineText(line)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  const renderInlineText = (text: string): React.ReactNode => {
    // First, handle timestamps
    const withTimestamps = renderTimestamps(text);

    // Then handle bold in each text segment
    return withTimestamps.map((segment, i) => {
      if (typeof segment === 'string') {
        return renderBoldText(segment, i);
      }
      return segment;
    });
  };

  const renderTimestamps = (text: string): (string | React.ReactNode)[] => {
    if (!videoUrl) {
      return [text];
    }

    const result: (string | React.ReactNode)[] = [];
    let lastIndex = 0;

    // Reset regex state
    TIMESTAMP_REGEX.lastIndex = 0;

    let match;
    while ((match = TIMESTAMP_REGEX.exec(text)) !== null) {
      // Add text before the timestamp
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }

      // Add clickable timestamp
      const timestamp = match[0];
      const seconds = timestampToSeconds(timestamp);
      const url = buildTimestampUrl(videoUrl, seconds);

      result.push(
        <button
          key={`ts-${match.index}`}
          onClick={() => navigateToTimestamp(url)}
          className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
          title={`Jump to ${timestamp}`}
        >
          {timestamp}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result.length > 0 ? result : [text];
  };

  const renderBoldText = (text: string, keyPrefix: number): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${keyPrefix}-bold-${i}`} className="font-medium text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div className="py-4">{renderContent(content)}</div>;
}

export function SummaryEmpty() {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        No summary available yet.
      </p>
    </div>
  );
}
