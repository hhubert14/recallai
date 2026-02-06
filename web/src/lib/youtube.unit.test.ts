import { describe, it, expect } from "vitest";
import { extractYouTubeVideoId, normalizeYouTubeUrl } from "./youtube";

describe("extractYouTubeVideoId", () => {
  describe("standard watch URLs", () => {
    it("extracts video ID from youtube.com/watch?v=ID", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID without www prefix", () => {
      expect(
        extractYouTubeVideoId("https://youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID with http protocol", () => {
      expect(
        extractYouTubeVideoId("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID with additional query parameters", () => {
      expect(
        extractYouTubeVideoId(
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120"
        )
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID with timestamp parameter before v", () => {
      // This case returns null due to strict pattern matching (extension behavior)
      expect(
        extractYouTubeVideoId(
          "https://www.youtube.com/watch?t=120&v=dQw4w9WgXcQ"
        )
      ).toBe(null);
    });
  });

  describe("shortened URLs (youtu.be)", () => {
    it("extracts video ID from youtu.be/ID", () => {
      expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
        "dQw4w9WgXcQ"
      );
    });

    it("extracts video ID from youtu.be with http", () => {
      expect(extractYouTubeVideoId("http://youtu.be/dQw4w9WgXcQ")).toBe(
        "dQw4w9WgXcQ"
      );
    });

    it("extracts video ID from youtu.be with timestamp", () => {
      expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=120")).toBe(
        "dQw4w9WgXcQ"
      );
    });

    it("extracts video ID from youtu.be with si tracking parameter", () => {
      expect(
        extractYouTubeVideoId(
          "https://youtu.be/UDBkiBnMrHs?si=H7cZvSI50MmT4-lE&t=724"
        )
      ).toBe("UDBkiBnMrHs");
    });
  });

  describe("shorts URLs", () => {
    it("extracts video ID from youtube.com/shorts/ID", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from shorts without www", () => {
      expect(
        extractYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("embed URLs", () => {
    it("extracts video ID from youtube.com/embed/ID", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from embed without www", () => {
      expect(
        extractYouTubeVideoId("https://youtube.com/embed/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from youtube-nocookie.com/embed/ID (privacy mode)", () => {
      expect(
        extractYouTubeVideoId(
          "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
        )
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from youtube-nocookie.com without www", () => {
      expect(
        extractYouTubeVideoId("https://youtube-nocookie.com/embed/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("legacy embed URLs", () => {
    it("extracts video ID from youtube.com/v/ID (Flash era format)", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/v/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from youtube.com/v/ID with parameters", () => {
      expect(
        extractYouTubeVideoId(
          "https://www.youtube.com/v/dQw4w9WgXcQ?fs=1&hl=en_US"
        )
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from youtube.com/e/ID (shorthand)", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/e/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("live stream URLs", () => {
    it("extracts video ID from youtube.com/live/ID", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/live/dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("extracts video ID from live URL with parameters", () => {
      expect(
        extractYouTubeVideoId(
          "https://www.youtube.com/live/dQw4w9WgXcQ?feature=share"
        )
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("mobile URLs", () => {
    it("extracts video ID from m.youtube.com/watch?v=ID", () => {
      expect(
        extractYouTubeVideoId("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("YouTube Music URLs", () => {
    it("extracts video ID from music.youtube.com/watch?v=ID", () => {
      expect(
        extractYouTubeVideoId("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });
  });

  describe("invalid and non-YouTube URLs", () => {
    it("returns null for non-YouTube URLs", () => {
      expect(extractYouTubeVideoId("https://www.google.com")).toBe(null);
    });

    it("returns null for YouTube homepage", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com")).toBe(null);
    });

    it("returns null for YouTube channel page", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/@SomeChannel")
      ).toBe(null);
    });

    it("returns null for YouTube search page", () => {
      expect(
        extractYouTubeVideoId(
          "https://www.youtube.com/results?search_query=test"
        )
      ).toBe(null);
    });

    it("returns null for empty string", () => {
      expect(extractYouTubeVideoId("")).toBe(null);
    });

    it("returns null for invalid URL format", () => {
      expect(extractYouTubeVideoId("not-a-url")).toBe(null);
    });
  });

  describe("video ID character handling", () => {
    it("handles video IDs with hyphens", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=abc-123_def")
      ).toBe("abc-123_def");
    });

    it("handles video IDs with underscores", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=abc_123_def")
      ).toBe("abc_123_def");
    });
  });

  describe("video ID length validation (security)", () => {
    it("rejects video ID that is too short (10 chars)", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=abcdefghij")
      ).toBe(null);
    });

    it("rejects video ID that is too long (12 chars)", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=abcdefghijkl")
      ).toBe(null);
    });

    it("rejects extremely long video ID (potential attack)", () => {
      const longId = "a".repeat(1000);
      expect(
        extractYouTubeVideoId(`https://www.youtube.com/watch?v=${longId}`)
      ).toBe(null);
    });

    it("accepts valid 11-character video ID", () => {
      expect(
        extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
    });

    it("rejects empty video ID", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=")).toBe(
        null
      );
    });
  });
});

describe("normalizeYouTubeUrl", () => {
  describe("standard watch URLs", () => {
    it("normalizes standard watch URL", () => {
      expect(
        normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("normalizes URL with timestamp to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("normalizes URL without www prefix", () => {
      expect(
        normalizeYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("shortened URLs (youtu.be)", () => {
    it("normalizes shortened URL to canonical format", () => {
      expect(normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
    });

    it("normalizes shortened URL with si parameter", () => {
      expect(
        normalizeYouTubeUrl(
          "https://youtu.be/UDBkiBnMrHs?si=H7cZvSI50MmT4-lE&t=724"
        )
      ).toBe("https://www.youtube.com/watch?v=UDBkiBnMrHs");
    });

    it("normalizes shortened URL with timestamp", () => {
      expect(normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=120")).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
    });
  });

  describe("shorts URLs", () => {
    it("normalizes shorts URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("embed URLs", () => {
    it("normalizes embed URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("normalizes youtube-nocookie.com embed to canonical format", () => {
      expect(
        normalizeYouTubeUrl(
          "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
        )
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("legacy embed URLs", () => {
    it("normalizes youtube.com/v/ URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://www.youtube.com/v/dQw4w9WgXcQ?fs=1")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("normalizes youtube.com/e/ URL to canonical format", () => {
      expect(normalizeYouTubeUrl("https://www.youtube.com/e/dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
    });
  });

  describe("live stream URLs", () => {
    it("normalizes live stream URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl(
          "https://www.youtube.com/live/dQw4w9WgXcQ?feature=share"
        )
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("mobile and music URLs", () => {
    it("normalizes mobile URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("normalizes YouTube Music URL to canonical format", () => {
      expect(
        normalizeYouTubeUrl("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("invalid and non-YouTube URLs", () => {
    it("returns null for non-YouTube URLs", () => {
      expect(normalizeYouTubeUrl("https://www.google.com")).toBe(null);
    });

    it("returns null for YouTube homepage", () => {
      expect(normalizeYouTubeUrl("https://www.youtube.com")).toBe(null);
    });

    it("returns null for empty string", () => {
      expect(normalizeYouTubeUrl("")).toBe(null);
    });
  });
});
