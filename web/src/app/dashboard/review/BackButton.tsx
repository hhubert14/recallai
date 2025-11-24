"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    fallbackUrl?: string;
    className?: string;
    children?: React.ReactNode;
}

export function BackButton({
    fallbackUrl = "/dashboard",
    className = "",
    children,
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Check if there's history to go back to
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            // Fallback to specified URL if no history
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            {children || "Back"}
        </button>
    );
}
