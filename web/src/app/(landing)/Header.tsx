"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserButton } from "@/components/ui/user-button";
import { Brain } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <Brain className="h-6 w-6 text-foreground transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight">RecallAI</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/library"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Library
              </Link>
              <Link
                href="/dashboard/review"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Review
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <UserButton />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
              >
                Log In
              </Link>
              <Button asChild size="sm" className="font-medium">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
