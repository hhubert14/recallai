import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useExtensionDetection } from "./useExtensionDetection";

describe("useExtensionDetection", () => {
  beforeEach(() => {
    // Reset chrome mock before each test
    vi.stubGlobal("chrome", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns isInstalled: false when chrome is undefined", async () => {
    const { result } = renderHook(() => useExtensionDetection());

    // When chrome is undefined, the check completes synchronously
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(false);
  });

  it("returns isInstalled: false when chrome.runtime is undefined", async () => {
    vi.stubGlobal("chrome", {});

    const { result } = renderHook(() => useExtensionDetection());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(false);
  });

  it("returns isInstalled: false when message times out (500ms)", async () => {
    vi.useFakeTimers();

    // Mock sendMessage that never calls the callback (simulates timeout)
    const sendMessageMock = vi.fn();
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: sendMessageMock,
        lastError: undefined,
      },
    });

    const { result } = renderHook(() => useExtensionDetection());

    expect(result.current.isChecking).toBe(true);

    // Advance past the timeout
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it("returns isInstalled: true when extension responds with { success: true }", async () => {
    const sendMessageMock = vi.fn(
      (
        _extensionId: string,
        _message: unknown,
        callback: (response: unknown) => void
      ) => {
        // Simulate extension responding successfully
        setTimeout(() => callback({ success: true }), 10);
      }
    );
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: sendMessageMock,
        lastError: undefined,
      },
    });

    const { result } = renderHook(() => useExtensionDetection());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(true);
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.any(String), // extension ID
      { action: "ping" },
      expect.any(Function)
    );
  });

  it("returns isInstalled: false when extension responds with error", async () => {
    const sendMessageMock = vi.fn(
      (
        _extensionId: string,
        _message: unknown,
        callback: (response: unknown) => void
      ) => {
        setTimeout(() => callback(undefined), 10);
      }
    );

    // Create a mock that returns lastError when accessed
    const chromeMock = {
      runtime: {
        sendMessage: sendMessageMock,
        get lastError() {
          return { message: "Extension not found" };
        },
      },
    };
    vi.stubGlobal("chrome", chromeMock);

    const { result } = renderHook(() => useExtensionDetection());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(false);
  });

  it("recheckInstallation() triggers new check", async () => {
    let callCount = 0;
    const sendMessageMock = vi.fn(
      (
        _extensionId: string,
        _message: unknown,
        callback: (response: unknown) => void
      ) => {
        callCount++;
        setTimeout(() => {
          callback(callCount === 1 ? undefined : { success: true });
        }, 10);
      }
    );

    // Dynamic lastError based on call count
    const chromeMock = {
      runtime: {
        sendMessage: sendMessageMock,
        get lastError() {
          return callCount === 1 ? { message: "Not found" } : undefined;
        },
      },
    };
    vi.stubGlobal("chrome", chromeMock);

    const { result } = renderHook(() => useExtensionDetection());

    // Wait for initial check (should be false due to error)
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(false);

    // Trigger recheck
    act(() => {
      result.current.recheckInstallation();
    });

    expect(result.current.isChecking).toBe(true);

    // Wait for recheck to complete (should be true now)
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isInstalled).toBe(true);
    expect(sendMessageMock).toHaveBeenCalledTimes(2);
  });
});
