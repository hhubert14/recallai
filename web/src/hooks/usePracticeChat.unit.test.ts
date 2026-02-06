import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePracticeChat } from "./usePracticeChat";

// Mock the ai-sdk/react useChat hook
const mockSendMessage = vi.fn();
const mockSetMessages = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [],
    sendMessage: mockSendMessage,
    setMessages: mockSetMessages,
    status: "ready",
    error: null,
  })),
}));

vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn(),
}));

import { useChat } from "@ai-sdk/react";

const mockConcept = {
  conceptName: "React Hooks",
  description: "Understanding React Hooks",
  itemIds: ["q-1", "f-2"],
};

describe("usePracticeChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      setMessages: mockSetMessages,
      status: "ready",
      error: null,
    } as unknown as ReturnType<typeof useChat>);
  });

  describe("sendMessage", () => {
    it("early returns when concept is null", () => {
      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: null,
        })
      );

      act(() => {
        result.current.sendMessage("test message");
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("early returns when message is empty", () => {
      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      act(() => {
        result.current.sendMessage("   ");
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("early returns when status is streaming", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "streaming",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      act(() => {
        result.current.sendMessage("test message");
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("early returns when status is submitted", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "submitted",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      act(() => {
        result.current.sendMessage("test message");
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("calls aiSendMessage with trimmed text and concept when allowed", () => {
      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      act(() => {
        result.current.sendMessage("  test message  ");
      });

      expect(mockSendMessage).toHaveBeenCalledWith(
        { text: "test message" },
        { body: { concept: mockConcept } }
      );
    });
  });

  describe("clearMessages", () => {
    it("calls setMessages with empty array", () => {
      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      act(() => {
        result.current.clearMessages();
      });

      expect(mockSetMessages).toHaveBeenCalledWith([]);
    });
  });

  describe("isSending", () => {
    it("returns true when status is streaming", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "streaming",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.isSending).toBe(true);
    });

    it("returns true when status is submitted", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "submitted",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.isSending).toBe(true);
    });

    it("returns false when status is ready", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "ready",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.isSending).toBe(false);
    });
  });

  describe("error", () => {
    it("returns error message when chat has error", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "error",
        error: new Error("Something went wrong"),
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.error).toBe("Something went wrong");
    });

    it("returns null when chat has no error", () => {
      vi.mocked(useChat).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "ready",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.error).toBe(null);
    });
  });

  describe("messages", () => {
    it("returns messages from useChat", () => {
      const mockMessages = [
        { id: "1", role: "user" as const, content: "Hello" },
        { id: "2", role: "assistant" as const, content: "Hi there!" },
      ];

      vi.mocked(useChat).mockReturnValue({
        messages: mockMessages,
        sendMessage: mockSendMessage,
        setMessages: mockSetMessages,
        status: "ready",
        error: null,
      } as unknown as ReturnType<typeof useChat>);

      const { result } = renderHook(() =>
        usePracticeChat({
          studySetPublicId: "abc123",
          concept: mockConcept,
        })
      );

      expect(result.current.messages).toEqual(mockMessages);
    });
  });
});
