"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
    size?: "sm" | "default" | "lg";
    variant?: "default" | "outline" | "secondary";
    className?: string;
}

export function UpgradeButton({ 
    size = "default", 
    variant = "default",
    className 
}: UpgradeButtonProps) {
    const router = useRouter();

    const handleUpgrade = () => {
        router.push("/dashboard/pricing");
    };

    return (
        <Button
            onClick={handleUpgrade}
            size={size}
            variant={variant}
            className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
        >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
            <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
    );
}
