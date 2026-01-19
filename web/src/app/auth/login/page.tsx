import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/app/auth/login/LoginForm";
import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
    title: "Log In | RecallAI",
    description: "Log in to your RecallAI account",
};

export default function LoginPage() {
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
                                RecallAI
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Log In
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Enter your email and password to access your
                            RecallAI dashboard
                        </p>
                    </div>

                    <LoginForm />

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/sign-up"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Sign up
                            </Link>
                        </p>
                        <p className="mt-2">
                            <Link
                                href="/auth/forgot-password"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Forgot your password?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
