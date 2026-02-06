import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "@/app/auth/sign-up/_components/SignUpForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
    title: "Sign Up | Retenio",
    description: "Sign up for your Retenio account",
};

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Theme toggle in top right */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 animate-fade-up">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/logo.png"
                                alt="Retenio"
                                width={32}
                                height={32}
                                className="transition-transform group-hover:scale-110"
                            />
                            <span className="text-2xl font-bold text-foreground">
                                Retenio
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Sign Up
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Enter your email and password to create your
                            Retenio account
                        </p>
                    </div>

                    <SignUpForm />

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Already have an account?{" "}
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
