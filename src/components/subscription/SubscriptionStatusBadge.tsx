import { Crown } from "lucide-react";
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
                "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium w-fit",
                "bg-blue-50 text-blue-700 border border-blue-200",
                className
            )}>
                <span>Free Plan</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium w-fit",
            "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200",
            className
        )}>
            <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
                <span className="capitalize whitespace-nowrap">
                    {planType ? `${planType} Plan` : 'Premium'}
                </span>
                {currentPeriodEnd && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                        Renews {formatDate(currentPeriodEnd)}
                    </span>
                )}
            </div>
        </div>
    );
}
