import { Crown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionStatusBadgeProps {
    isSubscribed: boolean;
    status?: string;
    planType?: string;
    currentPeriodEnd?: string;
    className?: string;
}

export function SubscriptionStatusBadge({ 
    isSubscribed, 
    status, 
    planType, 
    currentPeriodEnd,
    className 
}: SubscriptionStatusBadgeProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!isSubscribed) {
        return (
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
                "bg-gray-100 text-gray-600 border border-gray-200",
                className
            )}>
                <X className="h-4 w-4" />
                <span>Free Plan</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
            "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200",
            className
        )}>
            <Crown className="h-4 w-4 text-amber-500" />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="capitalize">
                        {planType ? `${planType} Plan` : 'Premium'}
                    </span>
                </div>
                {currentPeriodEnd && (
                    <span className="text-xs text-gray-500">
                        Renews {formatDate(currentPeriodEnd)}
                    </span>
                )}
            </div>
        </div>
    );
}
