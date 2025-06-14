"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        // Check if there's a previous page in the browser history
        if (window.history.length > 1) {
            router.back();
        } else {
            // Fallback to dashboard if no history
            router.push("/dashboard");
        }
    };

    return (
        <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </button>
    );
}
