export const WELCOME_STEPS = [
  {
    id: "welcome",
    title: "Your AI-Powered Study Partner",
    description: null, // Uses custom bullet list instead
    icon: "Sparkles" as const,
    bullets: [
      "Turn any content into study materials instantly",
      "Practice with an AI tutor that gives feedback",
      "Remember everything with spaced repetition",
    ],
  },
  {
    id: "chrome-extension",
    title: "Supercharge Your Learning",
    description:
      "Install our Chrome extension to automatically capture YouTube videos as you watch. No copy-pasting needed.",
    icon: "Chrome" as const,
    actionLabel: "Install from Chrome Web Store",
    actionUrl:
      "https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa",
  },
] as const;

export type WelcomeStep = (typeof WELCOME_STEPS)[number];

export const STORAGE_KEY = "welcome_modal_completed";
