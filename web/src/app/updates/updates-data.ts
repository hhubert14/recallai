export type UpdateCategory = "New Feature" | "Improvement" | "Fix";

export interface UpdateEntry {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  title: string;
  description: string;
  category: UpdateCategory;
}

// Add new entries at the TOP of this array (newest first)
export const updates: UpdateEntry[] = [
  {
    id: "2025-01-18-ai-chatbot",
    date: "2025-01-18",
    title: "AI Video Chatbot",
    description:
      "Ask questions about your videos and get AI-powered answers based on the transcript and summary. Get instant clarification on any concept.",
    category: "New Feature",
  },
  {
    id: "2025-01-10-improved-summaries",
    date: "2025-01-10",
    title: "Improved Summary Formatting",
    description:
      "Video summaries now feature better structure with clear sections, bullet points, and key takeaways for easier scanning.",
    category: "Improvement",
  },
  {
    id: "2025-01-01-chrome-extension-v2",
    date: "2025-01-01",
    title: "Chrome Extension 2.0",
    description:
      "Seamlessly capture YouTube videos as you watch. The extension now automatically syncs with your account - no manual token setup required.",
    category: "New Feature",
  },
];
