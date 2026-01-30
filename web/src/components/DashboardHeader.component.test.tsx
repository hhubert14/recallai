import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "./DashboardHeader";
import { useAuth } from "@/lib/auth-provider";
import { usePathname } from "next/navigation";

// Mock Supabase client creation before auth-provider is imported
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
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));
vi.mock("@/components/StreakBadge", () => ({
  StreakBadge: ({ userId }: { userId: string }) => (
    <div data-testid="streak-badge">Streak: {userId}</div>
  ),
}));
vi.mock("@/components/ui/user-button", () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));
vi.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));
vi.mock("@/components/ui/help-button", () => ({
  HelpButton: ({ tourId }: { tourId: string }) => (
    <div data-testid="help-button">Help: {tourId}</div>
  ),
}));

describe("DashboardHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue("/dashboard");
  });

  it("renders StreakBadge when user is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardHeader />);

    const streakBadge = screen.getByTestId("streak-badge");
    expect(streakBadge).toBeInTheDocument();
    expect(streakBadge).toHaveTextContent("Streak: user-123");
  });

  it("does not render StreakBadge when user is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardHeader />);

    expect(screen.queryByTestId("streak-badge")).not.toBeInTheDocument();
  });

  it("does not render StreakBadge when user is undefined", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardHeader />);

    expect(screen.queryByTestId("streak-badge")).not.toBeInTheDocument();
  });

  it("passes correct userId prop to StreakBadge", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "test-user-456" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardHeader />);

    const streakBadge = screen.getByTestId("streak-badge");
    expect(streakBadge).toHaveTextContent("Streak: test-user-456");
  });

  it("always renders UserButton and ThemeToggle", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<DashboardHeader />);

    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("renders HelpButton when tourId is available", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(usePathname).mockReturnValue("/dashboard");

    render(<DashboardHeader />);

    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("does not render HelpButton when tourId is not available", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(usePathname).mockReturnValue("/dashboard/library");

    render(<DashboardHeader />);

    expect(screen.queryByTestId("help-button")).not.toBeInTheDocument();
  });
});
