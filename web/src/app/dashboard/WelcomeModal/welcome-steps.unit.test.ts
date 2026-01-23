import { describe, it, expect } from "vitest";
import { WELCOME_STEPS, STORAGE_KEY } from "./welcome-steps";

/**
 * Tests for static welcome steps metadata used by the WelcomeModal.
 * This validates structure and invariants that other components rely on.
 */
describe("welcome-steps", () => {
  it("defines exactly 3 steps in the correct order", () => {
    expect(WELCOME_STEPS).toHaveLength(3);
    expect(WELCOME_STEPS.map((s) => s.id)).toEqual([
      "install-extension",
      "watch-and-learn",
      "review-and-remember",
    ]);
  });

  it("first step includes actionable fields for install CTA", () => {
    const installStep = WELCOME_STEPS[0];
    expect(installStep.id).toBe("install-extension");
    expect(installStep.actionLabel).toBe("Install from Chrome Web Store");
    expect(installStep.actionUrl).toMatch(
      /^https:\/\/chromewebstore\.google\.com\//
    );
  });

  it("non-install steps do not include action fields", () => {
    const nonInstallSteps = WELCOME_STEPS.slice(1);
    for (const step of nonInstallSteps) {
      expect("actionLabel" in step).toBe(false);
      expect("actionUrl" in step).toBe(false);
    }
  });

  it("all steps have required structure: id, title, description, icon", () => {
    for (const step of WELCOME_STEPS) {
      expect(typeof step.id).toBe("string");
      expect(typeof step.title).toBe("string");
      expect(typeof step.description).toBe("string");
      expect(["Puzzle", "Play", "Brain"]).toContain(step.icon);
    }
  });

  it("exports a stable STORAGE_KEY constant used for localStorage flag", () => {
    expect(STORAGE_KEY).toBe("welcome_modal_completed");
  });
});
