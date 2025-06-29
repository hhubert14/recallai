import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@/components/ui/user-button";

export function UpgradePrompt() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">RecallAI</span>
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
                            href="/dashboard/review"
                            className="text-sm font-medium text-blue-600"
                        >
                            Review
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Premium
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center space-y-6 p-8">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Crown className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-blue-900">
                            Premium Feature
                        </h1>
                        <p className="text-gray-500">
                            Spaced repetition is available for Premium subscribers only. 
                            Upgrade your plan to access this powerful learning tool.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link href="/dashboard/pricing">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                Upgrade to Premium
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
