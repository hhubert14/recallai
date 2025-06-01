'use client';

import { subscribeAction } from "@/lib/actions/stripe";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
    userId: string; // Assuming userId is passed as a prop
}

const SubscribeButton = ({ userId }: Props) => {
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
        <button
            onClick={handleSubscribe}
            className="subscribe-button"
            disabled={isPending}
        >
            Subscribe
        </button>
    );
};

export default SubscribeButton;
