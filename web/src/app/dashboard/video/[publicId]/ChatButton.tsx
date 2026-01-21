"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "./ChatSidebar";

interface ChatButtonProps {
    videoId: number;
}

export function ChatButton({ videoId }: ChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
                size="icon"
                title="Ask about this video"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>

            {/* Chat Sidebar */}
            <ChatSidebar
                videoId={videoId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
