import { describe, it, expect } from "vitest";
import { WindowBuilder } from "./window-builder";
import { TranscriptSegment } from "@/clean-architecture/domain/entities/transcript.entity";

function createSegments(count: number, durationPerSegment = 2): TranscriptSegment[] {
	return Array.from({ length: count }, (_, i) => ({
		text: `Segment ${i + 1}`,
		startTime: i * durationPerSegment,
		endTime: (i + 1) * durationPerSegment,
	}));
}

describe("WindowBuilder", () => {
	describe("constructor", () => {
		it("uses default values when no arguments provided", () => {
			const builder = new WindowBuilder();
			const segments = createSegments(30);
			const windows = builder.buildWindows(segments);

			expect(windows.length).toBeGreaterThan(0);
		});

		it("throws error when segmentsPerWindow <= overlapSegments", () => {
			expect(() => new WindowBuilder(10, 10)).toThrow(
				"segmentsPerWindow must be greater than overlapSegments"
			);
			expect(() => new WindowBuilder(5, 10)).toThrow(
				"segmentsPerWindow must be greater than overlapSegments"
			);
		});

		it("accepts valid custom values", () => {
			const builder = new WindowBuilder(15, 5);
			expect(builder).toBeDefined();
		});
	});

	describe("buildWindows", () => {
		it("returns empty array for empty segments", () => {
			const builder = new WindowBuilder();
			const windows = builder.buildWindows([]);

			expect(windows).toEqual([]);
		});

		it("creates single window for segments less than window size", () => {
			const builder = new WindowBuilder(20, 10);
			const segments = createSegments(5);
			const windows = builder.buildWindows(segments);

			expect(windows.length).toBe(1);
			expect(windows[0].windowIndex).toBe(0);
			expect(windows[0].text).toContain("Segment 1");
			expect(windows[0].text).toContain("Segment 5");
		});

		it("creates overlapping windows correctly", () => {
			const builder = new WindowBuilder(20, 10);
			const segments = createSegments(30);
			const windows = builder.buildWindows(segments);

			// stride = 20 - 10 = 10, so windows at i=0,10,20
			expect(windows.length).toBe(3);
			expect(windows[0].windowIndex).toBe(0);
			expect(windows[1].windowIndex).toBe(1);
			expect(windows[2].windowIndex).toBe(2);
		});

		it("captures correct start and end times", () => {
			const builder = new WindowBuilder(20, 10);
			const segments = createSegments(25, 2);
			const windows = builder.buildWindows(segments);

			expect(windows[0].startTime).toBe(0);
			expect(windows[0].endTime).toBe(40);

			expect(windows[1].startTime).toBe(20);
			expect(windows[1].endTime).toBe(50);
		});

		it("concatenates segment text with spaces", () => {
			const builder = new WindowBuilder(3, 1);
			const segments: TranscriptSegment[] = [
				{ text: "Hello", startTime: 0, endTime: 1 },
				{ text: "world", startTime: 1, endTime: 2 },
				{ text: "test", startTime: 2, endTime: 3 },
			];
			const windows = builder.buildWindows(segments);

			expect(windows[0].text).toBe("Hello world test");
		});

		it("floors startTime and ceils endTime", () => {
			const builder = new WindowBuilder(2, 1);
			const segments: TranscriptSegment[] = [
				{ text: "A", startTime: 0.3, endTime: 1.7 },
				{ text: "B", startTime: 1.7, endTime: 2.9 },
			];
			const windows = builder.buildWindows(segments);

			expect(windows[0].startTime).toBe(0);
			expect(windows[0].endTime).toBe(3);
		});

		it("handles exact window size", () => {
			const builder = new WindowBuilder(5, 2);
			const segments = createSegments(5);
			const windows = builder.buildWindows(segments);

			// stride = 5 - 2 = 3, so windows at i=0,3
			expect(windows.length).toBe(2);
			expect(windows[0].text).toContain("Segment 1");
			expect(windows[0].text).toContain("Segment 5");
		});

		it("creates multiple windows with proper stride", () => {
			const builder = new WindowBuilder(4, 2);
			const segments = createSegments(10);
			const windows = builder.buildWindows(segments);

			// stride = 4 - 2 = 2, so windows at i=0,2,4,6,8
			expect(windows.length).toBe(5);
			expect(windows[0].windowIndex).toBe(0);
			expect(windows[1].windowIndex).toBe(1);
			expect(windows[2].windowIndex).toBe(2);
			expect(windows[3].windowIndex).toBe(3);
			expect(windows[4].windowIndex).toBe(4);
		});
	});

	describe("estimateTokenCount", () => {
		it("estimates tokens as text length divided by 4", () => {
			const builder = new WindowBuilder();

			expect(builder.estimateTokenCount("hello")).toBe(2);
			expect(builder.estimateTokenCount("hello world")).toBe(3);
			expect(builder.estimateTokenCount("")).toBe(0);
		});

		it("rounds up for partial tokens", () => {
			const builder = new WindowBuilder();

			expect(builder.estimateTokenCount("hi")).toBe(1);
			expect(builder.estimateTokenCount("hey")).toBe(1);
		});
	});
});
