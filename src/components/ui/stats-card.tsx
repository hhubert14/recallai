"use client";

import { BookOpen, HelpCircle, Target, Calendar, LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    iconName: "BookOpen" | "HelpCircle" | "Target" | "Calendar";
    subtitle?: string;
}

const iconMap: Record<string, LucideIcon> = {
    BookOpen,
    HelpCircle,
    Target,
    Calendar,
};

export function StatsCard({ title, value, iconName, subtitle }: StatsCardProps) {
    const Icon = iconMap[iconName];
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
