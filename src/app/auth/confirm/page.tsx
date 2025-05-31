import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
    title: "Confirm Email | LearnSync",
    description: "Confirm your email address for LearnSync",
};

export default function ConfirmEmailPage() {
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
                            Check Your Email
                        </h1>
                        <div className="text-center text-gray-500">
                            <p>
                                We&apos;ve sent a confirmation email to your
                                address.
                            </p>
                            <p className="mt-2">
                                Please click the link in that email to activate
                                your account.
                            </p>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mt-8">
                        <p>
                            Didn&apos;t receive an email?{" "}
                            <Link
                                href="/auth/sign-up"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Try signing up again
                            </Link>
                        </p>
                        <p className="mt-2">
                            Already confirmed?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
