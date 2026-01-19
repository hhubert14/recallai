import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Play, ArrowRight, Library } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { RefreshButton } from "./RefreshButton";
import { DrizzleAnswerRepository } from "@/clean-architecture/infrastructure/repositories/answer.repository.drizzle";
import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";
import { FindVideosByUserIdUseCase } from "@/clean-architecture/use-cases/video/find-videos-by-user-id.use-case";
import { OnboardingSurveyWrapper } from "./OnboardingSurvey/OnboardingSurveyWrapper";
import { GetUserStatsUseCase } from "@/clean-architecture/use-cases/user-stats/get-user-stats.use-case";
import { GetProgressStatsUseCase } from "@/clean-architecture/use-cases/progress/get-progress-stats.use-case";
import { ReviewHeroCard } from "./ReviewHeroCard";
import { QuickStatsRow } from "./QuickStatsRow";
import { WhatsNewCard } from "./WhatsNewCard";

export const metadata: Metadata = {
  title: "Dashboard | RecallAI",
  description: "Your RecallAI dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [videos, userStats, progressStats] = await Promise.all([
    new FindVideosByUserIdUseCase(new DrizzleVideoRepository()).execute(
      user.id,
      4
    ),
    new GetUserStatsUseCase(
      new DrizzleVideoRepository(),
      new DrizzleAnswerRepository()
    ).execute(user.id),
    new GetProgressStatsUseCase(new DrizzleProgressRepository()).execute(
      user.id
    ),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OnboardingSurveyWrapper />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-foreground" />
            <span className="text-xl font-bold">RecallAI</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground"
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
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 md:py-12 px-6 md:px-8 max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Review Hero Card */}
          <ReviewHeroCard questionsDue={progressStats.questionsDueToday} />

          {/* Quick Stats Row */}
          <QuickStatsRow
            totalVideos={userStats.totalVideos}
            questionsMastered={progressStats.questionsInBox5}
            quizAccuracy={userStats.quizAccuracy}
          />

          {/* What's New + Recent Videos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* What's New Card */}
            <div className="lg:col-span-1">
              <WhatsNewCard />
            </div>

            {/* Recent Videos */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold">Recent Videos</h2>
                </div>
                <RefreshButton />
              </div>

              {videos.length > 0 ? (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/dashboard/video/${video.id}`}
                      className="block rounded-lg border border-border p-4 hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-muted dark:bg-white/10">
                          <Play className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm">
                            {video.title}
                          </h3>
                          {video.channelName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {video.channelName}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No videos yet. Install the Chrome extension and start
                    watching YouTube to build your library.
                  </p>
                  <a
                    href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-foreground hover:underline"
                  >
                    Get Chrome Extension
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}

              {videos.length > 0 && (
                <Link
                  href="/dashboard/library"
                  className="mt-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Library className="mr-1.5 h-4 w-4" />
                  View all in library
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
