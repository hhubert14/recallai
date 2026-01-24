// Centralized CSS import for driver.js - all tour components use this
import "driver.js/dist/driver.css";
import { driver, type Driver, type DriveStep } from "driver.js";

/**
 * Tour IDs for each page/section that has a guided tour
 */
export const TOUR_IDS = {
  dashboard: "dashboard",
  videoDetail: "video-detail",
  reviewModeSelector: "review-mode-selector",
  reviewSession: "review-session",
} as const;

export type TourId = (typeof TOUR_IDS)[keyof typeof TOUR_IDS];

/**
 * localStorage keys for tracking tour completion state
 */
export const TOUR_STORAGE_KEYS = {
  [TOUR_IDS.dashboard]: "tour_dashboard_completed",
  [TOUR_IDS.videoDetail]: "tour_video_detail_completed",
  [TOUR_IDS.reviewModeSelector]: "tour_review_mode_selector_completed",
  [TOUR_IDS.reviewSession]: "tour_review_session_completed",
} as const;

/**
 * data-tour-id attribute values for targeting elements
 * Use these with `[data-tour-id="value"]` selectors
 */
export const TOUR_TARGETS = {
  // Dashboard
  reviewHero: "review-hero",
  quickStats: "quick-stats",
  whatsNew: "whats-new",

  // Video Detail
  summaryTab: "summary-tab",
  qaTab: "qa-tab",
  flashcardsTab: "flashcards-tab",
  chatButton: "chat-button",

  // Review - Mode Selector
  studyModeCards: "study-mode-cards",
  startSessionBtn: "start-session-btn",
  progressFooter: "progress-footer",

  // Review - Active Session
  quizProgress: "quiz-progress",
  reviewContent: "review-content",
  actionButtons: "action-buttons",
} as const;

/**
 * Helper to create a CSS selector for a tour target
 */
export function tourSelector(target: string): string {
  return `[data-tour-id="${target}"]`;
}

interface CreateTourDriverOptions {
  steps: DriveStep[];
  onDestroyed?: () => void;
}

/**
 * Create a driver.js instance with consistent configuration
 * Use this to ensure all tours have the same look and feel
 */
export function createTourDriver({
  steps,
  onDestroyed,
}: CreateTourDriverOptions): Driver {
  return driver({
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    steps,
    animate: true,
    overlayColor: "rgb(0, 0, 0)",
    overlayOpacity: 0.5,
    stagePadding: 8,
    stageRadius: 8,
    allowClose: true,
    smoothScroll: true,
    popoverClass: "tour-popover",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
    onDestroyed,
  });
}
