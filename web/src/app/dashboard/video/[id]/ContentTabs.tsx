// TODO: Refactor file to be less verbose, we can potentially use layouts or parent containers
"use client";

import { useState } from "react";
import { QuizInterface } from "./QuizInterface";
import { FlashcardInterface } from "./FlashcardInterface";

const MAX_QUESTIONS = 20;
const MAX_FLASHCARDS = 20;
const COUNT_OPTIONS = [5, 10, 20] as const;

interface ContentTabsProps {
    summary: { id: number; videoId: number; content: string } | null;
    questions: {
        id: number;
        videoId: number;
        questionText: string;
        questionType: string;
        sourceTimestamp: number | null;
        options: {
            id: number;
            optionText: string;
            isCorrect: boolean;
            orderIndex: number | null;
            explanation: string | null;
        }[];
    }[];
    flashcards: {
        id: number;
        videoId: number;
        front: string;
        back: string;
    }[];
    videoId: number;
}

export function ContentTabs({
    summary,
    questions: initialQuestions,
    flashcards: initialFlashcards,
    videoId,
}: ContentTabsProps) {
    const [activeTab, setActiveTab] = useState<"summary" | "qa" | "flashcards">("summary");
    const [questions, setQuestions] = useState(initialQuestions);
    const [flashcards, setFlashcards] = useState(initialFlashcards);
    const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
    const [selectedFlashcardCount, setSelectedFlashcardCount] = useState<number>(5);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [questionError, setQuestionError] = useState<string | null>(null);
    const [flashcardError, setFlashcardError] = useState<string | null>(null);

    const remainingQuestionCapacity = MAX_QUESTIONS - questions.length;
    const availableQuestionCountOptions = COUNT_OPTIONS.filter(
        (count) => count <= remainingQuestionCapacity
    );
    const canGenerateQuestions = remainingQuestionCapacity > 0 && availableQuestionCountOptions.length > 0;

    const remainingFlashcardCapacity = MAX_FLASHCARDS - flashcards.length;
    const availableFlashcardCountOptions = COUNT_OPTIONS.filter(
        (count) => count <= remainingFlashcardCapacity
    );
    const canGenerateFlashcards = remainingFlashcardCapacity > 0 && availableFlashcardCountOptions.length > 0;

    async function handleGenerateQuestions() {
        setIsGeneratingQuestions(true);
        setQuestionError(null);

        try {
            const response = await fetch("/api/v1/questions/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, count: selectedQuestionCount }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setQuestions((prev) => [...prev, ...data.data.questions]);
            } else {
                setQuestionError(data.data?.error || "Failed to generate questions");
            }
        } catch {
            setQuestionError("Failed to generate questions. Please try again.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    }

    async function handleGenerateFlashcards() {
        setIsGeneratingFlashcards(true);
        setFlashcardError(null);

        try {
            const response = await fetch("/api/v1/flashcards/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, count: selectedFlashcardCount }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setFlashcards((prev) => [...prev, ...data.data.flashcards]);
            } else {
                setFlashcardError(data.data?.error || "Failed to generate flashcards");
            }
        } catch {
            setFlashcardError("Failed to generate flashcards. Please try again.");
        } finally {
            setIsGeneratingFlashcards(false);
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
                <button
                    onClick={() => setActiveTab("flashcards")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "flashcards"
                            ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 -mb-px"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    Flashcards ({flashcards.length})
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
                        {isGeneratingQuestions ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Generating {selectedQuestionCount} questions...
                                </p>
                            </div>
                        ) : questions.length > 0 ? (
                            <>
                                <QuizInterface
                                    questions={questions}
                                    videoId={videoId}
                                />
                                {canGenerateQuestions && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-3">
                                            <select
                                                value={selectedQuestionCount}
                                                onChange={(e) =>
                                                    setSelectedQuestionCount(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                                            >
                                                {availableQuestionCountOptions.map(
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
                                                onClick={handleGenerateQuestions}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Generate More
                                            </button>
                                        </div>
                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {questions.length} of {MAX_QUESTIONS}{" "}
                                            max
                                        </p>
                                        {questionError && (
                                            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                                                {questionError}
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
                                        value={selectedQuestionCount}
                                        onChange={(e) =>
                                            setSelectedQuestionCount(
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
                                        onClick={handleGenerateQuestions}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Generate
                                    </button>
                                </div>
                                {questionError && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-4">
                                        {questionError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "flashcards" && (
                    <div className="flex flex-col h-full">
                        {isGeneratingFlashcards ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Generating {selectedFlashcardCount} flashcards...
                                </p>
                            </div>
                        ) : flashcards.length > 0 ? (
                            <>
                                <FlashcardInterface flashcards={flashcards} />
                                {canGenerateFlashcards && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-3">
                                            <select
                                                value={selectedFlashcardCount}
                                                onChange={(e) =>
                                                    setSelectedFlashcardCount(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                                            >
                                                {availableFlashcardCountOptions.map(
                                                    (count) => (
                                                        <option
                                                            key={count}
                                                            value={count}
                                                        >
                                                            {count} flashcards
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <button
                                                onClick={handleGenerateFlashcards}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Generate More
                                            </button>
                                        </div>
                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {flashcards.length} of {MAX_FLASHCARDS}{" "}
                                            max
                                        </p>
                                        {flashcardError && (
                                            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                                                {flashcardError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                                    Generate flashcards
                                </p>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedFlashcardCount}
                                        onChange={(e) =>
                                            setSelectedFlashcardCount(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        {COUNT_OPTIONS.map((count) => (
                                            <option key={count} value={count}>
                                                {count} flashcards
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleGenerateFlashcards}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Generate
                                    </button>
                                </div>
                                {flashcardError && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-4">
                                        {flashcardError}
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
