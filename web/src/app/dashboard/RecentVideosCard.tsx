"use client";

import Link from "next/link";
import { Play, ArrowRight, Library, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { RefreshButton } from "./RefreshButton";

interface VideoData {
  id: number;
  publicId: string;
  title: string;
  channelName: string | null;
}

interface RecentVideosCardProps {
  videos: VideoData[];
}

export function RecentVideosCard({ videos }: RecentVideosCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`lg:col-span-2 rounded-xl border border-border bg-card p-6 opacity-0 transition-all duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:border-foreground/20 ${isInView ? "animate-fade-up" : ""}`}
      style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Recent Videos</h2>
        </div>
        <RefreshButton />
      </div>

      {videos.length > 0 ? (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <Link
              key={video.id}
              href={`/dashboard/video/${video.publicId}`}
              className={`group block rounded-lg border border-border p-4 hover:bg-muted/50 dark:hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:hover:shadow-none dark:hover:border-foreground/20 opacity-0 ${isInView ? "animate-fade-up" : ""}`}
              style={{
                animationDelay: `${600 + index * 75}ms`,
                animationFillMode: "forwards"
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted dark:bg-white/10 transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
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
        <div className="rounded-lg border border-dashed border-border p-8 text-center animate-fade-up">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No videos yet. Install the Chrome extension and start
            watching YouTube to build your library.
          </p>
          <Button asChild variant="outline" size="sm" className="group">
            <a
              href="https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Chrome Extension
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
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
  );
}
