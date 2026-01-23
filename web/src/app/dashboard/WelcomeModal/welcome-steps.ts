export const WELCOME_STEPS = [
  {
    id: "install-extension",
    title: "Install the Chrome Extension",
    description: "Capture YouTube videos as you watch them.",
    icon: "Puzzle" as const,
    actionLabel: "Install from Chrome Web Store",
    actionUrl:
      "https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa",
  },
  {
    id: "watch-and-learn",
    title: "Watch & Learn",
    description: "Our AI automatically generates summaries and quiz questions.",
    icon: "Play" as const,
  },
  {
    id: "review-and-remember",
    title: "Review & Remember",
    description: "Spaced repetition helps you retain what you learn long-term.",
    icon: "Brain" as const,
  },
] as const;

export type WelcomeStep = (typeof WELCOME_STEPS)[number];

export const STORAGE_KEY = "welcome_modal_completed";
