"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    exactMatch?: boolean;
}

interface SidebarNavItemProps {
    item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
    const pathname = usePathname();
    const { isCollapsed } = useSidebar();

    const isActive = item.exactMatch
        ? pathname === item.href
        : pathname.startsWith(item.href);

    const Icon = item.icon;

    const linkContent = (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                isCollapsed && "justify-center px-2"
            )}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
                <span className="truncate">{item.label}</span>
            )}
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}
