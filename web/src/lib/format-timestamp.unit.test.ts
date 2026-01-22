import { describe, it, expect } from "vitest";
import { formatTimestamp, parseTimestamp } from "./format-timestamp";

describe("formatTimestamp", () => {
  describe("when seconds is less than 60", () => {
    it("formats 0 seconds as 0:00", () => {
      expect(formatTimestamp(0)).toBe("0:00");
    });

    it("formats single digit seconds with leading zero", () => {
      expect(formatTimestamp(5)).toBe("0:05");
    });

    it("formats double digit seconds", () => {
      expect(formatTimestamp(45)).toBe("0:45");
    });
  });

  describe("when seconds is between 60 and 3600 (minutes range)", () => {
    it("formats 60 seconds as 1:00", () => {
      expect(formatTimestamp(60)).toBe("1:00");
    });

    it("formats minutes and seconds correctly", () => {
      expect(formatTimestamp(75)).toBe("1:15");
    });

    it("formats double digit minutes", () => {
      expect(formatTimestamp(630)).toBe("10:30");
    });

    it("formats 59:59 correctly", () => {
      expect(formatTimestamp(3599)).toBe("59:59");
    });
  });

  describe("when seconds is 3600 or more (hours range)", () => {
    it("formats exactly 1 hour as 1:00:00", () => {
      expect(formatTimestamp(3600)).toBe("1:00:00");
    });

    it("formats hours, minutes, and seconds correctly", () => {
      expect(formatTimestamp(3725)).toBe("1:02:05");
    });

    it("formats multiple hours correctly", () => {
      expect(formatTimestamp(7384)).toBe("2:03:04");
    });

    it("pads minutes and seconds with leading zeros in hours format", () => {
      expect(formatTimestamp(3601)).toBe("1:00:01");
    });
  });

  describe("when seconds has decimal values", () => {
    it("truncates decimal seconds", () => {
      expect(formatTimestamp(65.7)).toBe("1:05");
    });

    it("truncates decimal in hours format", () => {
      expect(formatTimestamp(3661.9)).toBe("1:01:01");
    });
  });
});

describe("parseTimestamp", () => {
  describe("when parsing MM:SS format", () => {
    it("parses 0:00 as 0 seconds", () => {
      expect(parseTimestamp("0:00")).toBe(0);
    });

    it("parses 0:05 as 5 seconds", () => {
      expect(parseTimestamp("0:05")).toBe(5);
    });

    it("parses 1:15 as 75 seconds", () => {
      expect(parseTimestamp("1:15")).toBe(75);
    });

    it("parses 10:30 as 630 seconds", () => {
      expect(parseTimestamp("10:30")).toBe(630);
    });

    it("parses 59:59 as 3599 seconds", () => {
      expect(parseTimestamp("59:59")).toBe(3599);
    });
  });

  describe("when parsing H:MM:SS format", () => {
    it("parses 1:00:00 as 3600 seconds", () => {
      expect(parseTimestamp("1:00:00")).toBe(3600);
    });

    it("parses 1:02:05 as 3725 seconds", () => {
      expect(parseTimestamp("1:02:05")).toBe(3725);
    });

    it("parses 2:03:04 as 7384 seconds", () => {
      expect(parseTimestamp("2:03:04")).toBe(7384);
    });
  });

  describe("roundtrip with formatTimestamp", () => {
    it("parseTimestamp(formatTimestamp(n)) === n for various values", () => {
      const testValues = [0, 5, 45, 60, 75, 630, 3599, 3600, 3725, 7384];
      for (const value of testValues) {
        expect(parseTimestamp(formatTimestamp(value))).toBe(value);
      }
    });
  });

  describe("edge cases", () => {
    it("returns null for invalid format", () => {
      expect(parseTimestamp("invalid")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseTimestamp("")).toBeNull();
    });

    it("returns null for single number", () => {
      expect(parseTimestamp("123")).toBeNull();
    });
  });
});
