"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegenerateTokenButton() {
    const editorExtensionId = "ahfeccogjadlimhhheblanpilcmbcjik";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const COOLDOWN_PERIOD = 30; // 30 seconds

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (cooldown > 0) {
            timer = setTimeout(() => {
                setCooldown(prevCooldown => prevCooldown - 1);
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [cooldown]);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const generateToken = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(
                "/api/v1/auth/extension/generate-token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate token");
            }

            if (chrome && chrome.runtime) {
                // Try to send to extension
                chrome.runtime.sendMessage(
                    editorExtensionId,
                    {
                        action: "authenticate",
                        data: {
                            email: data.user.email,
                            token: data.token,
                        },
                    },
                    response => {
                        if (!response || !response.success) {
                            console.warn(
                                "Extension not found or failed to authenticate:",
                                response
                            );
                            // Don't throw error, just show success for token generation
                        } else {
                            console.log("Extension authenticated successfully");
                        }
                    }
                );
            }

            setSuccess(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An unknown error occurred"
            );
        } finally {
            setIsLoading(false);
            setCooldown(COOLDOWN_PERIOD);
        }
    };

    const isDisabled = isLoading || cooldown > 0;
    const buttonText = isLoading ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
        </>
    ) : cooldown > 0 ? (
        <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Token ({cooldown}s)
        </>
    ) : (
        <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Token
        </>
    );

    return (
        <>
            {error && (
                <Alert className="bg-red-50 border-red-200 mb-2">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-50 border-green-200 mb-2">
                    <AlertDescription>
                        New token generated successfully! If you have the
                        extension installed, it has been automatically updated.
                    </AlertDescription>
                </Alert>
            )}

            <Button
                onClick={generateToken}
                disabled={isDisabled}
                variant="outline"
                className="w-fit flex items-center gap-2"
            >
                {buttonText}
            </Button>
        </>
    );
}
