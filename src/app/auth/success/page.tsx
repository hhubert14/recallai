import type { Metadata } from "next";
import Link from "next/link";
import { Brain, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Email Confirmed | RecallAI",
    description: "Your email has been confirmed successfully",
};

export default function EmailConfirmedPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Brain className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold">
                                RecallAI
                            </span>
                        </Link>
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
                            Email Confirmed!
                        </h1>
                        <div className="text-center text-gray-500">
                            <p>Your email has been successfully confirmed.</p>
                            <p className="mt-2">
                                Your account is now active and ready to use.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Link
                            href="/dashboard"
                            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Go to Dashboard
                        </Link>
                        {/* <Link
                            href="/"
                            className="flex w-full justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                        >
                            Return to Home
                        </Link> */}
                    </div>

                    {/* <div className="text-center text-sm text-gray-500 mt-8">
                        <p>
                            Need help?{" "}
                            <Link
                                href="/help"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
