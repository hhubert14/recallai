import { describe, it, expect } from "vitest";
import { formatTimestamp } from "./format-timestamp";

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
