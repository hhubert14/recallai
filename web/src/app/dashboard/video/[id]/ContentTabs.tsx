// TODO: Refactor file to be less verbose
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizInterface } from "./QuizInterface";

const MAX_QUESTIONS = 20;
const COUNT_OPTIONS = [5, 10, 20] as const;

interface ContentTabsProps {
    summary: { id: number; videoId: number; content: string } | null;
    questions: {
        id: number;
        videoId: number;
        questionText: string;
        questionType: string;
        options: {
            id: number;
            optionText: string;
            isCorrect: boolean;
            orderIndex: number | null;
            explanation: string | null;
        }[];
    }[];
    videoId: number;
}

export function ContentTabs({
    summary,
    questions: initialQuestions,
    videoId,
}: ContentTabsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"summary" | "qa">("summary");
    const [questions, setQuestions] = useState(initialQuestions);
    const [selectedCount, setSelectedCount] = useState<number>(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remainingCapacity = MAX_QUESTIONS - questions.length;
    const availableCountOptions = COUNT_OPTIONS.filter(
        (count) => count <= remainingCapacity
    );
    const canGenerate = remainingCapacity > 0 && availableCountOptions.length > 0;

    async function handleGenerate() {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch("/api/v1/questions/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, count: selectedCount }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setQuestions((prev) => [...prev, ...data.data.questions]);
                router.refresh();
            } else {
                setError(data.data?.error || "Failed to generate questions");
            }
        } catch {
            setError("Failed to generate questions. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-gray-50 dark:bg-gray-800">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "summary"
                            ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 -mb-px"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab("qa")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "qa"
                            ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 -mb-px"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    Q&A ({questions.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === "summary" && (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        {summary ? (
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                {summary.content}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No summary available for this video yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "qa" && (
                    <div className="flex flex-col h-full">
                        {isGenerating ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Generating {selectedCount} questions...
                                </p>
                            </div>
                        ) : questions.length > 0 ? (
                            <>
                                <QuizInterface
                                    questions={questions}
                                    videoId={videoId}
                                />
                                {canGenerate && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-3">
                                            <select
                                                value={selectedCount}
                                                onChange={(e) =>
                                                    setSelectedCount(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                                            >
                                                {availableCountOptions.map(
                                                    (count) => (
                                                        <option
                                                            key={count}
                                                            value={count}
                                                        >
                                                            {count} questions
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <button
                                                onClick={handleGenerate}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Generate More
                                            </button>
                                        </div>
                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {questions.length} of {MAX_QUESTIONS}{" "}
                                            max
                                        </p>
                                        {error && (
                                            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                                    Generate practice questions
                                </p>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedCount}
                                        onChange={(e) =>
                                            setSelectedCount(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        {COUNT_OPTIONS.map((count) => (
                                            <option key={count} value={count}>
                                                {count} questions
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleGenerate}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Generate
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-4">
                                        {error}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
