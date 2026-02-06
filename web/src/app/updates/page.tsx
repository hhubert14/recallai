import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Header } from "@/app/(landing)/_components/Header";
import { Footer } from "@/app/(landing)/_components/Footer";
import { updates } from "./_components/updates-data";
import { UpdateCard } from "./_components/UpdateCard";

export const metadata: Metadata = {
  title: "What's New - Retenio",
  description:
    "See the latest features, improvements, and updates to Retenio.",
};

export default function UpdatesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30 dark:bg-white/[0.01]">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted dark:bg-white/10 mb-4">
                <Sparkles className="w-7 h-7 text-foreground/70" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                What&apos;s New
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay up to date with the latest features, improvements, and
                fixes to Retenio.
              </p>
            </div>
          </div>
        </section>

        {/* Updates List */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="space-y-6">
              {updates.map((update, index) => (
                <UpdateCard key={update.id} update={update} delay={index * 100} />
              ))}
            </div>

            {updates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No updates yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
