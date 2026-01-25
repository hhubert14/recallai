"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HelpButton } from "@/components/ui/help-button";
import { TOUR_IDS, type TourId } from "@/components/tour/tour-constants";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/library", label: "My Library" },
  { href: "/dashboard/review", label: "Review" },
];

export function DashboardHeader() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Determine which tour to show based on current page
  const getTourId = (): TourId | null => {
    if (pathname === "/dashboard") {
      return TOUR_IDS.dashboard;
    }
    if (pathname.startsWith("/dashboard/study-set/")) {
      return TOUR_IDS.studySetDetail;
    }
    if (pathname === "/dashboard/review") {
      return TOUR_IDS.reviewModeSelector;
    }
    return null;
  };

  const tourId = getTourId();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Brain className="h-6 w-6 text-foreground transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xl font-bold">RecallAI</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:transition-transform after:duration-300 ${
                isActive(link.href, link.exact)
                  ? "text-foreground after:scale-x-100"
                  : "text-muted-foreground hover:text-foreground after:scale-x-0 after:origin-left hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {tourId && <HelpButton tourId={tourId} />}
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
