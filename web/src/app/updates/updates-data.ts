export type UpdateCategory = "New Feature" | "Improvement" | "Fix";

export interface UpdateEntry {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  title: string;
  description: string;
  category: UpdateCategory;
}

// Shared category colors for badges
export const categoryColors: Record<UpdateCategory, string> = {
  "New Feature":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Improvement:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Fix: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

// Format date for display (e.g., "Jan 18" or "January 18, 2026")
export function formatUpdateDate(
  dateString: string,
  options: { includeYear?: boolean } = {}
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: options.includeYear ? "long" : "short",
    day: "numeric",
    ...(options.includeYear && { year: "numeric" }),
  });
}

// Add new entries at the TOP of this array (newest first)
export const updates: UpdateEntry[] = [
  {
    id: "2026-01-18-ai-chatbot",
    date: "2026-01-18",
    title: "AI Video Chatbot",
    description:
      "Ask questions about your videos and get AI-powered answers based on the transcript. Features streaming responses, persistent chat history, and rate limiting.",
    category: "New Feature",
  },
  {
    id: "2026-01-12-faster-processing",
    date: "2026-01-12",
    title: "Faster Video Processing",
    description:
      "Videos now process faster with one less API call. All videos are processed regardless of content type, giving you full control over what you learn from.",
    category: "Improvement",
  },
  {
    id: "2025-12-21-transcript-timestamps",
    date: "2025-12-21",
    title: "Transcript Timestamps",
    description:
      "Transcripts now include precise timestamps, enabling accurate linking between quiz questions and their relevant video moments.",
    category: "Improvement",
  },
  {
    id: "2025-12-14-on-demand-generation",
    date: "2025-12-14",
    title: "On-Demand Question Generation",
    description:
      "Generate quiz questions on demand for any video in your library. No need to wait for initial processing to get more practice questions.",
    category: "New Feature",
  },
  {
    id: "2025-12-06-manual-processing",
    date: "2025-12-06",
    title: "Manual Video Processing",
    description:
      "Manually add any YouTube video URL to process. Perfect for videos you've already watched or want to study from your backlog.",
    category: "New Feature",
  },
  {
    id: "2025-12-03-chrome-extension-v2",
    date: "2025-12-03",
    title: "Chrome Extension 2.0",
    description:
      "Completely rebuilt Chrome extension with session-based authentication. No more manual token setup - just sign in and start capturing videos.",
    category: "New Feature",
  },
  {
    id: "2025-12-02-onboarding-survey",
    date: "2025-12-02",
    title: "Onboarding Survey",
    description:
      "New users now see a welcome survey to help us understand how you plan to use RecallAI. Your feedback shapes the future of the product.",
    category: "New Feature",
  },
];
