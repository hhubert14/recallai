"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Settings, User, HelpCircle, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { useSidebar } from "./sidebar-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarUserSection() {
    const { isCollapsed } = useSidebar();
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const themeButton = (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "text-sidebar-foreground",
                isCollapsed && "justify-center px-2"
            )}
        >
            {mounted && (
                <>
                    {theme === "light" ? (
                        <Moon className="h-5 w-5 shrink-0" />
                    ) : (
                        <Sun className="h-5 w-5 shrink-0" />
                    )}
                </>
            )}
            {!mounted && <div className="h-5 w-5 shrink-0" />}
            {!isCollapsed && (
                <span className="truncate">
                    {mounted ? (theme === "light" ? "Dark mode" : "Light mode") : "Theme"}
                </span>
            )}
        </button>
    );

    const userMenuTrigger = (
        <button
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "text-sidebar-foreground",
                isCollapsed && "justify-center px-2"
            )}
        >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4" />
            </div>
            {!isCollapsed && (
                <>
                    <span className="flex-1 truncate text-left">
                        {user?.email || "Account"}
                    </span>
                    <ChevronUp className="h-4 w-4 shrink-0" />
                </>
            )}
        </button>
    );

    return (
        <div className="flex flex-col gap-1">
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>{themeButton}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                        {mounted ? (theme === "light" ? "Dark mode" : "Light mode") : "Theme"}
                    </TooltipContent>
                </Tooltip>
            ) : (
                themeButton
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>{userMenuTrigger}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12}>
                                {user?.email || "Account"}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        userMenuTrigger
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56"
                    side="right"
                    align="end"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user?.email || "My Account"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                Manage your account
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href="mailto:hubert@recallai.io">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Contact Support</span>
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isLoading ? "Signing out..." : "Sign out"}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
