import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, CheckCircle, Crown } from "lucide-react";
import { UserButton } from "@/components/ui/user-button";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/data-access/subscriptions/get-user-subscription-status";
import SubscribeButton from "@/components/subscription/SubscribeButton";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
    title: "Pricing | LearnSync",
    description: "Choose the perfect plan for your learning journey",
};

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const subscriptionStatus = await getUserSubscriptionStatus(user.id);

    const plans = [
        {
            id: "free",
            name: "Free",
            description: "Perfect for trying out LearnSync.",
            price: 0,
            features: [
                "5 videos per month",
                "Auto-generated study questions", 
                "Smart study notes",
                "Progress tracking",
                "7-day storage",
            ],
            isCurrent: !subscriptionStatus.isSubscribed,
            buttonText: "Current Plan",
            buttonDisabled: !subscriptionStatus.isSubscribed,
        },
        {
            id: "premium",
            name: "Premium",
            description: "For serious learners.",
            price: 9.99,
            features: [
                "Unlimited videos",
                "Auto-generated study questions",
                "Spaced repetition system", 
                "Smart study notes",
                "Progress tracking",
                "Unlimited storage",
            ],
            isPopular: true,
            isCurrent: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "premium",
            buttonText: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "premium" ? "Current Plan" : "Upgrade to Premium",
            buttonDisabled: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "premium",
        },
        {
            id: "student",
            name: "Student",
            description: "Special discount for students.",
            price: 4.99,
            features: [
                "All Premium features included",
                ".edu email verification required",
            ],
            isCurrent: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "student",
            buttonText: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "student" ? "Current Plan" : "Verify Student Status",
            buttonDisabled: subscriptionStatus.isSubscribed && subscriptionStatus.planType === "student",
        },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold">LearnSync</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/library"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            My Library
                        </Link>
                        <Link
                            href="/dashboard/pricing"
                            className="text-sm font-medium text-blue-600"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="text-sm font-medium hover:text-blue-600"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12">                <div className="mb-8">
                    <div className="mb-4">
                        <BackButton />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
                            Choose Your Plan
                        </h1>
                        <p className="text-gray-500 max-w-2xl">
                            Choose the plan that's right for you and start transforming your learning experience today.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`flex flex-col rounded-lg border p-6 shadow-sm relative ${
                                plan.isPopular
                                    ? "border-2 border-blue-600 bg-white shadow-lg"
                                    : plan.isCurrent
                                    ? "border-2 border-green-500 bg-green-50"
                                    : "border border-blue-100 bg-white"
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            {plan.isCurrent && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm font-medium py-1 px-3 rounded-full flex items-center gap-1">
                                    <Crown className="h-3 w-3" />
                                    Current Plan
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-blue-900">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-500">
                                    {plan.description}
                                </p>
                            </div>
                            
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold text-blue-900">
                                    ${plan.price}
                                </span>
                                <span className="ml-1 text-gray-500">
                                    /month
                                </span>
                            </div>
                            
                            <ul className="mt-6 space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-8">
                                {plan.id === "premium" && !plan.isCurrent ? (
                                    <SubscribeButton userId={user.id} />
                                ) : (
                                    <Button
                                        disabled={plan.buttonDisabled}
                                        className={`w-full ${
                                            plan.isCurrent
                                                ? "bg-green-600 hover:bg-green-600 cursor-default"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info Section */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-blue-900">
                            Why Upgrade to Premium?
                        </h2>
                        <p className="text-gray-500">
                            Unlock the full potential of your learning with unlimited access to all features.
                        </p>
                    </div>
                    
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-lg border border-blue-100 bg-blue-50">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Unlimited Learning
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Process unlimited videos and never worry about monthly limits again.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border border-blue-100 bg-blue-50">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Advanced Features
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Access spaced repetition and advanced study tools for better retention.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border border-blue-100 bg-blue-50">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Permanent Storage
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Keep your study materials forever with unlimited storage.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg border border-blue-100 bg-blue-50">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Priority Support
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Get faster response times and dedicated customer support.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
