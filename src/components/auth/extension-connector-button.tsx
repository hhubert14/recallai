"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ExtensionConnectorButton() {
    const editorExtensionId = "ahfeccogjadlimhhheblanpilcmbcjik";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const COOLDOWN_PERIOD = 30; // 30 seconds

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (cooldown > 0) {
            timer = setTimeout(() => {
                setCooldown((prevCooldown) => prevCooldown - 1);
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [cooldown]);

    const generateToken = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/extension/generate-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate token");
            }

            if (chrome && chrome.runtime) {
                // Make a request:
                chrome.runtime.sendMessage(
                    editorExtensionId,
                    {
                        email: data.user.email,
                        token: data.token,
                    },
                    (response) => {
                        if (!response.success) {
                            throw new Error(
                                response.error || "Failed to open URL in editor"
                            );
                        }
                        console.log("URL opened in editor successfully");
                    }
                );
            }
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
            Connecting...
        </>
    ) : cooldown > 0 ? (
        `Connect Extension (${cooldown}s)`
    ) : (
        "Connect Extension"
    );

    return (
        <>
            {error && (
                <Alert className="bg-red-50 border-red-200 mb-2">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button
                onClick={generateToken}
                disabled={isDisabled}
                className="bg-blue-600 hover:bg-blue-700"
            >
                {buttonText}
            </Button>
        </>
    );
}
