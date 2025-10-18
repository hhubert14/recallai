"use client";

import { subscribeAction } from "@/lib/actions/stripe";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
    userId: string;
    className?: string;
}

const SubscribeButton = ({ userId, className }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSubscribe = async () => {
        startTransition(async () => {
            try {
                const url = await subscribeAction({ userId });
                if (url) {
                    router.push(url);
                } else {
                    console.error("Failed to create subscription session.");
                }
            } catch (error) {
                console.error("Error during subscription:", error);
            }
        });
    };

    return (
        <Button
            className={className || "mt-8 bg-blue-600 hover:bg-blue-700"}
            onClick={handleSubscribe}
            disabled={isPending}
        >
            Subscribe
        </Button>
    );
};

export default SubscribeButton;
