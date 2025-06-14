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
    children = "Back to Dashboard"
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Check if there's history to go back to
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            // Fallback to specified URL if no history
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            {children}
        </button>
    );
}
