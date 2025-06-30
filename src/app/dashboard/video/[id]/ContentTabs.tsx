"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SummaryDto } from "@/data-access/summaries/types";
import { QuestionDto } from "@/data-access/questions/types";
import { QuizInterface } from "./QuizInterface";

interface ContentTabsProps {
    summary: SummaryDto | null;
    questions: QuestionDto[];
    userId: string;
    videoId: number;
}

export function ContentTabs({ summary, questions, userId, videoId }: ContentTabsProps) {
    const [activeTab, setActiveTab] = useState<"summary" | "qa">("summary");

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "summary"
                            ? "border-blue-600 text-blue-600 bg-white -mb-px"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab("qa")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "qa"
                            ? "border-blue-600 text-blue-600 bg-white -mb-px"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Q&A ({questions.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === "summary" && (
                    <div className="prose prose-sm max-w-none">
                        {summary ? (
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                                {summary.content}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
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
                                <p className="text-gray-500 text-lg">
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
