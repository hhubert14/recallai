import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
    ArrowRight,
    Brain,
    CheckCircle,
    Chrome,
    Clock,
    FileQuestion,
    Laptop,
    Library,
    Lightbulb,
    Search,
    Youtube,
    Zap,
    BarChart,
    BookOpen,
    Layers,
    Shield,
} from "lucide-react";
import { Sub } from "@radix-ui/react-dropdown-menu";
import SubscribeButton from "@/components/subscription/SubscribeButton";

export default function Home() {
    return (
        <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">RecallAI</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="#how-it-works"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#features"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#faq"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            FAQ
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline underline-offset-4 hidden sm:inline-block"
                        >
                            Log In
                        </Link>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href="/auth/sign-up">Get Started Free</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-8 md:py-16 lg:py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    <span>
                                        Transform Video Learning with AI
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-blue-900 dark:text-blue-100">
                                        Transform Video Learning with AI-Powered
                                        Summaries
                                    </h1>
                                    <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
                                        RecallAI automatically creates concise
                                        summaries and active recall questions
                                        from educational YouTube videos, helping
                                        you retain knowledge better.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                                    >
                                        <Link href="/auth/sign-up">
                                            Get Started Free{" "}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                        asChild
                                    >
                                        <Link
                                            href="https://chrome.google.com/webstore"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download Extension
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                    <span>No credit card required</span>
                                    <CheckCircle className="ml-2 h-4 w-4 text-blue-600" />
                                    <span>Start free today</span>
                                    <CheckCircle className="ml-2 h-4 w-4 text-blue-600" />
                                    <span>Upgrade anytime</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/dashboard-preview.png"
                                    width={600}
                                    height={300}
                                    alt="RecallAI Dashboard Preview"
                                    className="rounded-lg object-contain shadow-xl border border-gray-200 dark:border-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Statement Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    The Problem with Video Learning
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    In today's information-rich world, people
                                    consume massive amounts of educational video
                                    content but struggle with poor retention
                                    rates. Most learners watch videos passively
                                    without taking notes or reviewing key
                                    concepts, leading to forgotten information
                                    within days.
                                </p>
                            </div>
                            <div className="w-full max-w-3xl py-12">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Card className="border-blue-100 dark:border-red-800 bg-white dark:bg-gray-900">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center space-y-4 text-center">
                                                <div className="rounded-full bg-red-100 dark:bg-red-950/30 p-3">
                                                    <Youtube className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                                    Traditional Learning
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Passive video watching with
                                                    minimal retention and no
                                                    structured review system.
                                                </p>
                                                <ul className="space-y-2 text-left w-full">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-500 dark:text-red-400 mt-1">
                                                            ✕
                                                        </span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            Information
                                                            forgotten within
                                                            days
                                                        </span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-500 dark:text-red-400 mt-1">
                                                            ✕
                                                        </span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            No organized
                                                            learning materials
                                                        </span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-500 dark:text-red-400 mt-1">
                                                            ✕
                                                        </span>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            Time wasted
                                                            rewatching videos
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center space-y-4 text-center">
                                                <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-3">
                                                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                                    RecallAI Learning
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Active learning with
                                                    AI-generated summaries and
                                                    recall questions.
                                                </p>
                                                <ul className="space-y-2 text-left w-full">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            Improved knowledge
                                                            retention
                                                        </span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            Organized learning
                                                            library
                                                        </span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            Time saved with
                                                            concise summaries
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section
                    id="how-it-works"
                    className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-blue-950/10"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    How It Works
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    Simple 3-Step Process
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    RecallAI seamlessly integrates with your
                                    learning routine, requiring minimal effort
                                    while delivering maximum results.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Watch
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Install the Chrome extension and watch
                                    educational videos on YouTube as normal.
                                </p>
                                <div className="rounded-full bg-blue-50 dark:bg-red-950/30 p-3">
                                    <Youtube className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Process
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    AI automatically detects educational content
                                    and creates summaries and questions in the
                                    background.
                                </p>
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3">
                                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Learn
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Access your personalized learning materials
                                    through the web app to review and practice.
                                </p>
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3">
                                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section
                    id="features"
                    className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    Features
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    Powerful Learning Tools
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    RecallAI combines cutting-edge AI with
                                    proven learning techniques to help you
                                    retain knowledge better.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <Chrome className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Automatic Detection
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Chrome extension intelligently identifies
                                    educational YouTube videos.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    AI-Powered Summaries
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Creates concise, well-structured summaries
                                    highlighting key concepts and important
                                    details.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <FileQuestion className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Active Recall Questions
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Generates 5 custom questions with answers
                                    for each video to strengthen memory
                                    retention.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <Library className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Personal Learning Library
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Centralized web dashboard where all
                                    processed videos are stored and organized.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <Laptop className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                    Cross-Device Access
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Study materials available on any device
                                    through the web application.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3 w-12 h-12 flex items-center justify-center">
                                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-blue-900 dark:text-white">
                                        Smart Search
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Coming Soon
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Find specific topics across your entire
                                    video library with powerful search
                                    capabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-blue-950/10">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/benefits.png"
                                    width={550}
                                    height={550}
                                    alt="RecallAI Benefits Visualization"
                                    className="rounded-lg object-cover shadow-xl"
                                />
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                        Benefits
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                        Transform Passive Watching into Active
                                        Learning
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                        RecallAI helps you get more value from
                                        every educational video you watch.
                                    </p>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
                                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">
                                                Save Time
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No need to rewatch videos or
                                                take manual notes.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
                                            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">
                                                Improve Retention
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Boost knowledge retention
                                                through proven active recall
                                                techniques.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
                                            <Library className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">
                                                Build Your Library
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Create a searchable library of
                                                learning insights.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
                                            <Laptop className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-900 dark:text-blue-100">
                                                Study Anywhere
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Access your learning materials
                                                on any device, anytime.
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Target Audience Section */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    Who It's For
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    Perfect for All Types of Learners
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    RecallAI is designed for anyone who wants
                                    to                                    get more value from educational videos.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-3">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    Students
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    High school, college, and graduate students
                                    looking to improve their study efficiency.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-3">
                                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    Lifelong Learners
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Professional and personal learners who
                                    regularly consume educational content.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-3">
                                    <Youtube className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    Content Creators
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Educators and content creators who want to
                                    provide more value to their audience.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-3">
                                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    Exam Preppers
                                </h3>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    People preparing for certifications or exams
                                    who need efficient study materials.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof Section
                <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600">
                                    Testimonials
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900">
                                    What Our Users Say
                                </h2>
                                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed">
                                    Join thousands of satisfied users who have
                                    transformed their learning experience with
                                    RecallAI.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
                            <div className="flex flex-col justify-between rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                    <blockquote className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                        "RecallAI has completely changed how I
                                        study. I retain so much more information
                                        now and save hours of time."
                                    </blockquote>
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <Image
                                        src="/placeholder.svg?height=40&width=40"
                                        width={40}
                                        height={40}
                                        alt="Alex Chen"
                                        className="rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Alex Chen</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Computer Science Student
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                    <blockquote className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                        "As a teacher, I recommend RecallAI to
                                        all my students. It's like having a
                                        personal note-taker and tutor in one."
                                    </blockquote>
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <Image
                                        src="/placeholder.svg?height=40&width=40"
                                        width={40}
                                        height={40}
                                        alt="Maria Rodriguez"
                                        className="rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Maria Rodriguez
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            High School Teacher
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                    <blockquote className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                        "I'm preparing for my medical board
                                        exams, and RecallAI has been a
                                        game-changer for organizing all my study
                                        materials."
                                    </blockquote>
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <Image
                                        src="/placeholder.svg?height=40&width=40"
                                        width={40}
                                        height={40}
                                        alt="James Wilson"
                                        className="rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            James Wilson
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Medical Student
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto max-w-5xl">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                    <BarChart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                            85%
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Improvement in knowledge retention
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                    <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                            3.5 hrs
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Average time saved per week
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                    <Youtube className="h-10 w-10 text-red-600 dark:text-red-400" />
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                            250K+
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Videos processed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                    <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                            98%
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            User satisfaction rate
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Pricing Section */}
                <section
                    id="pricing"
                    className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    Pricing
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    Simple, Transparent Pricing
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    Choose the plan that's right for you and
                                    start transforming your learning experience
                                    today.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-4xl gap-6 py-12 md:grid-cols-2">
                            <div className="flex flex-col rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-blue-900 dark:text-white">
                                        Free
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Perfect for trying out RecallAI.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                                        $0
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        /month
                                    </span>
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {[
                                        "5 videos at a time",
                                        "Auto-generated study questions",
                                        "Smart study notes",
                                        "Progress tracking",
                                        // "Manual video categorization",
                                        "7-day storage",
                                    ].map(feature => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="mt-8 bg-blue-600 hover:bg-blue-700" asChild>
                                    <Link href="/auth/sign-up">Get Started</Link>
                                </Button>
                            </div>
                            <div className="flex flex-col rounded-lg border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900 p-6 shadow-lg relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium py-1 px-3 rounded-full">
                                    Most Popular
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-blue-900 dark:text-white">
                                        Premium
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        For serious learners.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                                        $4.99
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        /month
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Just $0.16 per day
                                </p>
                                <ul className="mt-6 space-y-3">
                                    {[
                                        "Unlimited videos",
                                        "Auto-generated study questions",
                                        "Spaced repetition system",
                                        "Smart study notes",
                                        "Progress tracking",
                                        "Unlimited storage",
                                        "Keep all videos forever (existing + future videos)"
                                    ].map(feature => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="mt-8 bg-blue-600 hover:bg-blue-700" asChild>
                                    <Link href="/auth/sign-up">Get Started</Link>
                                </Button>
                                {/* <SubscribeButton userId="your-user-id" /> */}
                                {/* <Button className="mt-8 bg-blue-600 hover:bg-blue-700">
                                    Get Started
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section
                    id="faq"
                    className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-blue-950/10"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                                    FAQ
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-blue-900 dark:text-blue-100">
                                    Frequently Asked Questions
                                </h2>
                                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                                    Find answers to common questions about
                                    RecallAI.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto max-w-3xl space-y-4 py-12">
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    How does RecallAI detect educational
                                    videos?
                                </h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                    RecallAI uses a combination of video
                                    metadata, content analysis, and user
                                    behavior patterns to identify educational
                                    content. It works best with videos that have
                                    clear educational intent, such as tutorials,
                                    lectures, and explainer videos.
                                </p>
                            </div>
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    Is my data private and secure?
                                </h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                    Yes, we take privacy and security seriously.
                                    Your learning data is encrypted and stored
                                    securely. We do not share your personal
                                    information with third parties, and you can
                                    delete your data at any time.
                                </p>
                            </div>
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    How accurate are the AI-generated summaries?
                                </h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                    RecallAI uses advanced AI technology specifically 
                                    optimized for educational content. While no AI is 
                                    perfect, our users report high satisfaction with 
                                    the accuracy and usefulness of the summaries. 
                                    You can always provide feedback to help us improve.
                                </p>
                            </div>
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    Can I use RecallAI with videos in languages
                                    other than English?
                                </h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                    Currently, RecallAI works best with
                                    English-language videos. We're actively
                                    working on adding support for additional
                                    languages in the near future.
                                </p>
                            </div>
                            {/* <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-blue-900">
                                    Can I share my summaries with friends or
                                    classmates?
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    Yes, Premium users can share summaries and
                                    questions with others through a secure link.
                                    The recipient doesn't need a RecallAI
                                    account to view shared content.
                                </p>
                            </div> */}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 dark:bg-blue-800">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Ready to Transform Your Learning Experience?
                                </h2>
                                <p className="max-w-[600px] md:text-xl/relaxed text-blue-100 dark:text-blue-50">
                                    Join thousands of satisfied users who have
                                    improved their knowledge retention with
                                    RecallAI.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-white gap-1"
                                    asChild
                                >
                                    <Link href="/auth/sign-up">
                                        Get Started Free{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white bg-transparent text-white hover:!bg-white hover:!text-blue-600 hover:!border-blue-600 dark:border-blue-200 dark:bg-transparent dark:text-blue-100 dark:hover:!bg-blue-100 dark:hover:!text-blue-700 dark:hover:!border-blue-100"
                                    asChild
                                >
                                    <Link href="#" target="_blank">
                                        Download Extension
                                    </Link>
                                </Button>
                            </div>
                            <p className="text-sm text-blue-100 dark:text-blue-200">
                                No credit card required. Start learning for
                                free.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-12">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 lg:grid-cols-5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    RecallAI
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Transform video learning with AI-powered
                                summaries and active recall questions.
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    href="#"
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="#features"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#pricing"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Chrome Extension
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Roadmap
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="mailto:hubert@recallai.io"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="mailto:hubert@recallai.io"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Contact Support
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="mailto:hubert@recallai.io?subject=Bug Report"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Report a Bug
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="mailto:hubert@recallai.io?subject=Feature Request"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Feature Request
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="/terms"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Terms
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Cookies
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Licenses
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} RecallAI. All rights
                        reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
