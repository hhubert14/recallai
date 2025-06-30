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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </button>
    );
}
