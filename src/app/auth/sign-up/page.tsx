import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/app/auth/sign-up/SignUpForm";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign Up | LearnSync",
    description: "Sign up for your LearnSync account",
};

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Brain className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold">
                                LearnSync
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
                            Sign Up
                        </h1>
                        <p className="text-center text-gray-500">
                            Enter your email and password to create your
                            LearnSync account
                        </p>
                    </div>

                    <SignUpForm />

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Login
                            </Link>
                        </p>
                        <p className="mt-2">
                            <Link
                                href="/auth/forgot-password"
                                className="font-medium text-blue-600 hover:text-blue-500"
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
