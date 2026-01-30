import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/auth/forgot-password/ForgotPasswordForm";
import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
    title: "Reset Password | Retenio",
    description: "Reset your Retenio account password",
};

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Theme toggle in top right */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 animate-fade-up">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Brain className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold text-foreground">
                                Retenio
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Reset Password
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Enter your email and we&apos;ll send you a link to reset
                            your password
                        </p>
                    </div>

                    <ForgotPasswordForm />

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Remember your password?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
