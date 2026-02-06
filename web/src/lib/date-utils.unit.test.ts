import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getLocalDateString } from "./date-utils";

describe("getLocalDateString", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("without timezone parameter (original behavior)", () => {
    it("returns date in YYYY-MM-DD format", () => {
      vi.setSystemTime(new Date("2025-03-15T10:30:00"));
      expect(getLocalDateString()).toBe("2025-03-15");
    });

    it("pads single-digit month with leading zero", () => {
      vi.setSystemTime(new Date("2025-01-05T10:30:00"));
      expect(getLocalDateString()).toBe("2025-01-05");
    });

    it("pads single-digit day with leading zero", () => {
      vi.setSystemTime(new Date("2025-12-01T10:30:00"));
      expect(getLocalDateString()).toBe("2025-12-01");
    });

    it("accepts custom date parameter", () => {
      const customDate = new Date("2024-06-20T15:00:00");
      expect(getLocalDateString(customDate)).toBe("2024-06-20");
    });
  });

  describe("with timezone parameter", () => {
    it("handles timezone behind UTC (America/Los_Angeles)", () => {
      // When it's midnight UTC on Jan 2nd, it's still Jan 1st in LA (UTC-8)
      const utcMidnight = new Date("2025-01-02T00:00:00Z");
      expect(getLocalDateString(utcMidnight, "America/Los_Angeles")).toBe(
        "2025-01-01"
      );
    });

    it("handles timezone ahead of UTC (Asia/Tokyo)", () => {
      // When it's 11pm UTC on Jan 1st, it's already Jan 2nd in Tokyo (UTC+9)
      const utcLateNight = new Date("2025-01-01T23:00:00Z");
      expect(getLocalDateString(utcLateNight, "Asia/Tokyo")).toBe("2025-01-02");
    });

    it("falls back to local date for invalid timezone", () => {
      vi.setSystemTime(new Date("2025-03-15T10:30:00"));
      // Invalid timezone should fall back to original behavior
      expect(getLocalDateString(new Date(), "Invalid/Timezone")).toBe(
        "2025-03-15"
      );
    });

    it("handles UTC timezone correctly", () => {
      const utcDate = new Date("2025-06-15T12:00:00Z");
      expect(getLocalDateString(utcDate, "UTC")).toBe("2025-06-15");
    });

    it("handles timezone with half-hour offset (Asia/Kolkata)", () => {
      // When it's 6pm UTC on Jan 1st, it's 11:30pm in Kolkata (UTC+5:30)
      const utcEvening = new Date("2025-01-01T18:00:00Z");
      expect(getLocalDateString(utcEvening, "Asia/Kolkata")).toBe("2025-01-01");

      // When it's 7pm UTC on Jan 1st, it's 12:30am Jan 2nd in Kolkata
      const utcLaterEvening = new Date("2025-01-01T19:00:00Z");
      expect(getLocalDateString(utcLaterEvening, "Asia/Kolkata")).toBe(
        "2025-01-02"
      );
    });
  });
});
