"use client";

import { Sidebar, SidebarProvider, useSidebar } from "@/components/sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main
                className="flex-1 transition-[margin] duration-200 ease-in-out"
                style={{
                    marginLeft: isCollapsed
                        ? "var(--sidebar-width-collapsed)"
                        : "var(--sidebar-width)",
                }}
            >
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
    );
}
