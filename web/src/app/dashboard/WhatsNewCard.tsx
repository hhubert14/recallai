import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { updates, UpdateCategory } from "@/app/updates/updates-data";

const categoryColors: Record<UpdateCategory, string> = {
  "New Feature":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Improvement:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Fix: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function WhatsNewCard() {
  // Show the 2 most recent updates
  const recentUpdates = updates.slice(0, 2);

  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">What&apos;s New</h2>
      </div>

      <div className="space-y-4 flex-1">
        {recentUpdates.map((update) => (
          <div key={update.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[update.category]}`}
              >
                {update.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(update.date)}
              </span>
            </div>
            <h3 className="font-medium text-sm">{update.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {update.description}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/updates"
        className="mt-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        View all updates
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
