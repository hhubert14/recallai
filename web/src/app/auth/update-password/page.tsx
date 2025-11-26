import type { Metadata } from "next";
import Link from "next/link";
import { UpdatePasswordForm } from "@/app/auth/update-password/UpdatePasswordForm";
import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
    title: "Update Password | RecallAI",
    description: "Update your password for your RecallAI account",
};

export default function UpdatePasswordPage() {
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
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                            Update Password
                        </h1>
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            Enter your new password below
                        </p>
                    </div>

                    <UpdatePasswordForm />
                </div>
            </div>
        </div>
    );
}
