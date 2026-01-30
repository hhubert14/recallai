import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
    title: "Confirm Email | Retenio",
    description: "Confirm your email address for Retenio",
};

export default function ConfirmEmailPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 animate-fade-up">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Brain className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold text-foreground">Retenio</span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Check Your Email
                        </h1>
                        <div className="text-center text-muted-foreground">
                            <p>
                                We&apos;ve sent a confirmation email to your
                                address.
                            </p>
                            <p className="mt-2">
                                Please click the link in that email to activate
                                your account.
                            </p>
                            <p className="mt-2 text-sm">
                                Can&apos;t find it? Check your spam or junk
                                folder.
                            </p>
                        </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-8">
                        <p>
                            Didn&apos;t receive an email?{" "}
                            <Link
                                href="/auth/sign-up"
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Try signing up again
                            </Link>
                        </p>
                        <p className="mt-2">
                            Already confirmed?{" "}
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
