import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock ResizeObserver for Radix UI components (tooltips, popovers, etc.)
// See: https://vitest.dev/guide/mocking#mocking-globals
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
