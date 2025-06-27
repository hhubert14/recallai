"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

export function UserButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, signOut } = useAuth();

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                >
                    <User className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
                <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                >
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
    );
}
