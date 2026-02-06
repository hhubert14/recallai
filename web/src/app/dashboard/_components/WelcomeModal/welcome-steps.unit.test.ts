import { describe, it, expect } from "vitest";
import { WELCOME_STEPS, STORAGE_KEY } from "./welcome-steps";

/**
 * Tests for static welcome steps metadata used by the WelcomeModal.
 * This validates structure and invariants that other components rely on.
 */
describe("welcome-steps", () => {
  it("defines exactly 5 steps in the correct order", () => {
    expect(WELCOME_STEPS).toHaveLength(5);
    expect(WELCOME_STEPS.map((s) => s.id)).toEqual([
      "welcome",
      "chrome-extension",
      "pin-extension",
      "extension-demo",
      "create-first-study-set",
    ]);
  });

  it("chrome extension step includes actionable fields for install CTA", () => {
    const extensionStep = WELCOME_STEPS[1];
    expect(extensionStep.id).toBe("chrome-extension");
    expect(extensionStep.actionLabel).toBe("Install from Chrome Web Store");
    expect(extensionStep.actionUrl).toMatch(
      /^https:\/\/chromewebstore\.google\.com\//
    );
  });

  it("non-extension steps do not include action fields", () => {
    const nonExtensionSteps = [
      WELCOME_STEPS[0],
      WELCOME_STEPS[2],
      WELCOME_STEPS[3],
      WELCOME_STEPS[4],
    ];
    for (const step of nonExtensionSteps) {
      expect("actionLabel" in step).toBe(false);
      expect("actionUrl" in step).toBe(false);
    }
  });

  it("all steps have required structure: id, title, icon (or null)", () => {
    for (const step of WELCOME_STEPS) {
      expect(typeof step.id).toBe("string");
      expect(typeof step.title).toBe("string");
      expect(["Sparkles", "Chrome", null]).toContain(step.icon);
    }
  });

  it("exports a stable STORAGE_KEY constant used for localStorage flag", () => {
    expect(STORAGE_KEY).toBe("welcome_modal_completed");
  });
});
