"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button.js";
import { ExternalLink, Loader2 } from "lucide-react";
import { createBillingPortalSession } from "@/lib/actions/billing-portal.js";

interface ManageBillingButtonProps {
    userId: string;
    className?: string;
}

export function ManageBillingButton({
    userId,
    className,
}: ManageBillingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const handleManageBilling = async () => {
        setIsLoading(true);
        try {
            const result = await createBillingPortalSession({
                userId,
                returnUrl: `${window.location.origin}/dashboard/settings`,
            });

            // Redirect to the billing portal URL
            if (result?.url) {
                window.location.href = result.url;
            } else {
                throw new Error("No billing portal URL received");
            }
        } catch (error: unknown) {
            console.error("Error opening billing portal:", error);

            // Show user-friendly error message
            if (error instanceof Error) {
                const errorMessage =
                    error.message ||
                    "Failed to open billing portal. Please try again.";
                alert(errorMessage);
            } else {
                const errorMessage =
                    String(error) ||
                    "Failed to open billing portal. Please try again.";
                alert(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleManageBilling}
            disabled={isLoading}
            variant="outline"
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                </>
            ) : (
                <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                </>
            )}
        </Button>
    );
}
