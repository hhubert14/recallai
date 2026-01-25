import type { DriveStep } from "driver.js";
import { TOUR_IDS, TOUR_TARGETS, tourSelector, type TourId } from "./tour-constants";

/**
 * Dashboard tour steps
 * Introduces: Review hero card, Quick stats, What's new
 */
export const dashboardSteps: DriveStep[] = [
  {
    element: tourSelector(TOUR_TARGETS.reviewHero),
    popover: {
      title: "Ready to Review?",
      description:
        "When you have items due for review, they'll appear here. Click to start a review session and reinforce your learning!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.quickStats),
    popover: {
      title: "Track Your Progress",
      description:
        "See your learning stats at a glance: videos watched, items mastered, and quiz accuracy.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.whatsNew),
    popover: {
      title: "What's New",
      description:
        "Stay updated with the latest features and improvements. We're always adding new ways to help you learn!",
      side: "right",
      align: "start",
    },
  },
];

/**
 * Video detail page tour steps
 * Introduces: Summary tab, Q&A tab, Flashcards tab, Chat button
 */
export const videoDetailSteps: DriveStep[] = [
  {
    element: tourSelector(TOUR_TARGETS.summaryTab),
    popover: {
      title: "AI Summary",
      description:
        "An AI-generated summary of the video's key points. Perfect for quick review or catching up on content.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.qaTab),
    popover: {
      title: "Quiz Questions",
      description:
        "Test your understanding with AI-generated questions. Your answers feed into our spaced repetition system.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.flashcardsTab),
    popover: {
      title: "Flashcards",
      description:
        "Study key concepts with flashcards. Flip to reveal answers and reinforce your memory.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.chatButton),
    popover: {
      title: "Ask Questions",
      description:
        "Have a question about the video? Chat with AI to get instant answers based on the content.",
      side: "left",
      align: "center",
    },
  },
];

/**
 * Review mode selector tour steps
 * Introduces: Study mode cards, Start button, Progress footer
 */
export const reviewModeSelectorSteps: DriveStep[] = [
  {
    element: tourSelector(TOUR_TARGETS.studyModeCards),
    popover: {
      title: "Choose Your Study Mode",
      description:
        "Review due items, learn new content, or practice randomly. Pick what fits your study goals!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.startSessionBtn),
    popover: {
      title: "Start Your Session",
      description:
        "Ready to learn? Click here to begin your review session.",
      side: "top",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.progressFooter),
    popover: {
      title: "Your Mastery Progress",
      description:
        "Track items you've mastered, ones in progress, and how many are due today. Keep building that knowledge!",
      side: "top",
      align: "center",
    },
  },
];

/**
 * Review session tour steps (active quiz/flashcard session)
 * Introduces: Progress indicator, Question/flashcard area, Action buttons
 */
export const reviewSessionSteps: DriveStep[] = [
  {
    element: tourSelector(TOUR_TARGETS.quizProgress),
    popover: {
      title: "Session Progress",
      description:
        "Track how far you are in your review session. Keep going to complete all items!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.reviewContent),
    popover: {
      title: "Answer Questions",
      description:
        "Read the question and select your answer. For flashcards, try to recall the answer before flipping!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: tourSelector(TOUR_TARGETS.actionButtons),
    popover: {
      title: "Check & Continue",
      description:
        "Check your answer to see if you're right, then move to the next item. Correct answers help you master the content faster!",
      side: "top",
      align: "center",
    },
  },
];

/**
 * Get steps for a specific tour
 */
export function getTourSteps(tourId: TourId): DriveStep[] {
  switch (tourId) {
    case TOUR_IDS.dashboard:
      return dashboardSteps;
    case TOUR_IDS.studySetDetail:
      return videoDetailSteps;
    case TOUR_IDS.reviewModeSelector:
      return reviewModeSelectorSteps;
    case TOUR_IDS.reviewSession:
      return reviewSessionSteps;
    default:
      return [];
  }
}
