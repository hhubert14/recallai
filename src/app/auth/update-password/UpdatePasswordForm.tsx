"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/auth/update-password-success");
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleForgotPassword} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div>
                <Label htmlFor="password">New password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1"
                    placeholder="New password (8+ characters)"
                    minLength={8}
                    maxLength={64}
                />
            </div>

            <div>
                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save new password"}
                </Button>
            </div>
        </form>
    );
}
