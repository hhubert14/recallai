"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HelpButton } from "@/components/ui/help-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StreakBadge } from "@/components/StreakBadge";
import { useAuth } from "@/lib/auth-provider";
import { TOUR_IDS, type TourId } from "@/components/tour/tour-constants";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/library", label: "My Library" },
  { href: "/dashboard/review", label: "Review" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64" aria-describedby={undefined}>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={isActive(link.href, link.exact)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(link.href, link.exact)
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Retenio"
              width={40}
              height={40}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-xl font-bold">Retenio</span>
          </Link>
        </div>
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
          {user && <StreakBadge userId={user.id} />}
          {tourId && (
            <div className="hidden md:block">
              <HelpButton tourId={tourId} />
            </div>
          )}
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
