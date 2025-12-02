"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("space-y-6", className)} {...props}>
            {success ? (
                <div className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            Check Your Email
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Password reset instructions sent
                        </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            If you registered using your email and password, you
                            will receive a password reset email.
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                            Can&apos;t find it? Check your spam or junk folder.
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send reset email"}
                    </Button>
                </form>
            )}
        </div>
    );
}
