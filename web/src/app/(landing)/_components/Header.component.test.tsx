import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import { useAuth } from "@/lib/auth-provider";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/auth-provider");
vi.mock("@/components/ui/user-button", () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));
vi.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mobile navigation menu (guest)", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it("renders a hamburger menu button", () => {
      render(<Header />);

      expect(
        screen.getByRole("button", { name: /open menu/i })
      ).toBeInTheDocument();
    });

    it("opens sheet with guest nav links when hamburger is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(
        screen.getByRole("link", { name: "How It Works" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Features" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Updates" })
      ).toBeInTheDocument();
    });

    it("shows Log In and Get Started links in the mobile menu", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(
        screen.getByRole("link", { name: "Log In" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Get Started" })
      ).toBeInTheDocument();
    });

    it("closes the sheet when a nav link is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("link", { name: "Features" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("mobile navigation menu (authenticated)", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: "user-123" },
        loading: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it("opens sheet with dashboard nav links when hamburger is clicked", async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(
        screen.getByRole("link", { name: "Dashboard" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "My Library" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Review" })
      ).toBeInTheDocument();
    });
  });
});
