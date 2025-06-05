import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { ExtensionConnectorButton } from "@/app/dashboard/ExtensionConnectorButton";

export const metadata: Metadata = {
    title: "Dashboard | LearnSync",
    description: "Your LearnSync dashboard",
};

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">LearnSync</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12">
                <h1 className="text-3xl font-bold tracking-tight text-blue-900 mb-6">
                    Welcome to your Dashboard
                </h1>
                <p className="text-gray-500 mb-8">
                    This is a placeholder dashboard. You've successfully signed
                    in with Supabase authentication.
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">
                            Getting Started
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Install the Chrome extension to start capturing
                            video summaries.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Download Extension
                            </Button>
                            <ExtensionConnectorButton />
                        </div>
                    </div>

                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">
                            Recent Summaries
                        </h2>
                        <p className="text-gray-500">
                            You don't have any summaries yet. Watch educational
                            videos with the extension installed to create
                            summaries.
                        </p>
                    </div>

                    <div className="rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Your Stats</h2>
                        <p className="text-gray-500">
                            Track your learning progress and video consumption
                            here.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
