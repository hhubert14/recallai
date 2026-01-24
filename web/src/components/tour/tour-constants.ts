// Centralized CSS import for driver.js - all tour components use this
import "driver.js/dist/driver.css";

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
