"use client";

import { useState } from "react";
// import { Button } from "@/components/ui/button";
import { SummaryDto } from "@/data-access/summaries/types";
import { QuestionDto } from "@/data-access/questions/types";
import { QuizInterface } from "./QuizInterface";

interface ContentTabsProps {
    summary: SummaryDto | null;
    questions: QuestionDto[];
    userId: string;
    videoId: number;
}

export function ContentTabs({
    summary,
    questions,
    userId,
    videoId,
}: ContentTabsProps) {
    const [activeTab, setActiveTab] = useState<"summary" | "qa">("summary");

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
                    <div>
                        {questions.length > 0 ? (
                            <QuizInterface
                                questions={questions}
                                userId={userId}
                                videoId={videoId}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No questions available for this video yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
