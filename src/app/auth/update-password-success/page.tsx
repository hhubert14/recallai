import type { Metadata } from "next";
import Link from "next/link";
import { Brain, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
    title: "Password Updated | RecallAI",
    description: "Your password has been successfully updated",
};

export default function UpdatePasswordSuccessPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
            {/* Theme toggle in top right */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                RecallAI
                            </span>
                        </Link>
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                            Password Updated!
                        </h1>
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <p>Your password has been successfully updated.</p>
                            <p className="mt-2">
                                You can now use your new password to log in to
                                your account.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Link
                            href="/auth/login"
                            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Continue to Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
