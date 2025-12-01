"use client";

import { Brain, PanelLeftClose, PanelLeft, LayoutDashboard, Library, Settings } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { SidebarNavItem, type NavItem } from "./sidebar-nav-item";
import { SidebarUserSection } from "./sidebar-user-section";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exactMatch: true,
    },
    {
        href: "/dashboard/library",
        label: "My Library",
        icon: Library,
    },
    {
        href: "/dashboard/review",
        label: "Review",
        icon: Brain,
    },
    {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const { isCollapsed, toggleSidebar } = useSidebar();

    const toggleButton = (
        <button
            onClick={toggleSidebar}
            className={cn(
                "flex items-center justify-center rounded-md p-1.5 transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "text-sidebar-foreground"
            )}
        >
            {isCollapsed ? (
                <PanelLeft className="h-5 w-5" />
            ) : (
                <PanelLeftClose className="h-5 w-5" />
            )}
        </button>
    );

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out",
                isCollapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div
                    className={cn(
                        "flex h-16 items-center border-b border-sidebar-border px-3",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}
                >
                    {!isCollapsed && (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sidebar-foreground"
                        >
                            <Brain className="h-6 w-6 text-blue-600" />
                            <span className="text-xl font-bold">RecallAI</span>
                        </Link>
                    )}
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12}>
                                Expand sidebar
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        toggleButton
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                    {navItems.map((item) => (
                        <SidebarNavItem key={item.href} item={item} />
                    ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-sidebar-border p-2">
                    <SidebarUserSection />
                </div>
            </div>
        </aside>
    );
}
