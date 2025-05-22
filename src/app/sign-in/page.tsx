import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/app/sign-in/sign-in-form";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign In | LearnSync",
    description: "Sign in to your LearnSync account",
};

export default function SignInPage() {
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
                            Sign in to your account
                        </h1>
                        <p className="text-center text-gray-500">
                            Enter your email and password to access your
                            LearnSync dashboard
                        </p>
                    </div>

                    <SignInForm />

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Don't have an account?{" "}
                            <Link
                                href="/sign-up"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Sign up
                            </Link>
                        </p>
                        <p className="mt-2">
                            <Link
                                href="/forgot-password"
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
