"use client";

import * as React from "react";
import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(
    undefined
);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            setIsCollapsed(stored === "true");
        }
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => {
            const newValue = !prev;
            localStorage.setItem(STORAGE_KEY, String(newValue));
            return newValue;
        });
    }, []);

    const setCollapsed = useCallback((collapsed: boolean) => {
        setIsCollapsed(collapsed);
        localStorage.setItem(STORAGE_KEY, String(collapsed));
    }, []);

    const value = useMemo(
        () => ({
            isCollapsed: mounted ? isCollapsed : true,
            toggleSidebar,
            setCollapsed,
        }),
        [isCollapsed, mounted, toggleSidebar, setCollapsed]
    );

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
