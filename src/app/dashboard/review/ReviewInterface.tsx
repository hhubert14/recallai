"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuestionForReviewDto } from "@/data-access/user-question-progress/types";
import { ReviewStatsDto } from "@/data-access/user-question-progress/get-review-stats";
import { processReviewAnswer } from "@/app/dashboard/review/actions";

interface ReviewInterfaceProps {
    userId: string;
    reviewStats: ReviewStatsDto;
    dueQuestions: QuestionForReviewDto[];
    initialQuestions: QuestionForReviewDto[];
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to shuffle questions and their options
function shuffleQuestionsAndOptions(
    questions: QuestionForReviewDto[]
): QuestionForReviewDto[] {
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.map(question => ({
        ...question,
        options: shuffleArray(question.options),
    }));
}

export function ReviewInterface({
    userId,
    reviewStats,
    dueQuestions,
    initialQuestions,
}: ReviewInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
        null
    );
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allQuestions, setAllQuestions] = useState<QuestionForReviewDto[]>(
        []
    );

    // Shuffle questions and their options when component mounts or questions change
    useEffect(() => {
        const combined = [...dueQuestions, ...initialQuestions];
        setAllQuestions(shuffleQuestionsAndOptions(combined));
    }, [dueQuestions, initialQuestions]);

    // Check if session is complete first (before accessing questions)
    const sessionComplete =
        allQuestions.length === 0 ||
        currentQuestionIndex >= allQuestions.length;

    // Only access current question if session is not complete
    const currentQuestion = sessionComplete
        ? null
        : allQuestions[currentQuestionIndex];

    // Check if this is the last question (only if session not complete)
    const isLastQuestion =
        !sessionComplete && currentQuestionIndex === allQuestions.length - 1;

    // Find the selected option for result display
    const selectedOption = currentQuestion?.options.find(
        option => option.id === selectedOptionId
    );

    // Calculate aggregated stats for clearer display
    const inProgressQuestions =
        reviewStats.questionsInBox1 +
        reviewStats.questionsInBox2 +
        reviewStats.questionsInBox3 +
        reviewStats.questionsInBox4;
    const masteredQuestions = reviewStats.questionsInBox5;

    const handleSubmit = async () => {
        if (!selectedOptionId || !currentQuestion) return;

        setIsSubmitting(true);

        const selectedOption = currentQuestion.options.find(
            option => option.id === selectedOptionId
        );

        if (!selectedOption) {
            setIsSubmitting(false);
            return;
        }

        // Process the answer for spaced repetition
        await processReviewAnswer({
            user_id: userId,
            question_id: currentQuestion.question_id,
            selected_option_id: selectedOptionId,
            is_correct: selectedOption.is_correct,
        });

        setShowResult(true);
        setIsSubmitting(false);
    };

    const handleNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOptionId(null);
            setShowResult(false);
        }
    };

    const handleFinish = () => {
        // Mark session as complete by going beyond last question
        setCurrentQuestionIndex(allQuestions.length);
    };

    // Early return for session complete to avoid accessing invalid indices
    if (sessionComplete && allQuestions.length > 0) {
        return (
            <div className="max-w-2xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {reviewStats.questionsDueToday}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due Today
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {reviewStats.totalQuestionsInSystem}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Questions
                        </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                            {inProgressQuestions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            In Progress
                        </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {masteredQuestions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Mastered
                        </p>
                    </div>
                </div>

                {/* Session complete message */}
                <div className="text-center py-12 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                            🎉 Session Complete!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Great job! You've completed all available questions.
                            Reviewed questions will appear again based on their
                            spaced repetition schedule.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            Start New Session
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Show "no questions" screen if there are no questions to review
    if (allQuestions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {reviewStats.questionsDueToday}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due Today
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {reviewStats.totalQuestionsInSystem}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Questions
                        </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                            {inProgressQuestions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            In Progress
                        </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {masteredQuestions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Mastered
                        </p>
                    </div>
                </div>

                {/* No questions message */}
                <div className="text-center py-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            No Questions Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            You don't have any questions due for review today.
                            Complete some video quizzes to add questions to your
                            spaced repetition system.
                        </p>

                        <Button
                            onClick={() =>
                                (window.location.href = "/dashboard")
                            }
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Guard against null currentQuestion
    if (!currentQuestion) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300">
                        Loading question...
                    </p>
                </div>
            </div>
        );
    }

    // Main quiz interface
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {reviewStats.questionsDueToday}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due Today
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {reviewStats.totalQuestionsInSystem}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Questions
                    </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {inProgressQuestions}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        In Progress
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {masteredQuestions}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mastered
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                </span>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {currentQuestion.question_text}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map(option => (
                        <label
                            key={option.id}
                            className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedOptionId === option.id
                                    ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            } ${
                                showResult
                                    ? option.is_correct
                                        ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : selectedOptionId === option.id &&
                                            !option.is_correct
                                          ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                                          : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="option"
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                onChange={() =>
                                    !showResult &&
                                    setSelectedOptionId(option.id)
                                }
                                disabled={showResult}
                                className="sr-only"
                            />
                            <div className="flex items-center">
                                <div
                                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                        selectedOptionId === option.id
                                            ? "border-blue-600 dark:border-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    {selectedOptionId === option.id && (
                                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    )}
                                </div>
                                <span className="text-gray-900 dark:text-white">
                                    {option.option_text}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Result */}
            {showResult && (
                <div
                    className={`p-4 rounded-lg ${
                        selectedOption?.is_correct
                            ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                    }`}
                >
                    <div className="flex items-center mb-2">
                        <span
                            className={`font-medium ${
                                selectedOption?.is_correct
                                    ? "text-green-800 dark:text-green-100"
                                    : "text-red-800 dark:text-red-100"
                            }`}
                        >
                            {selectedOption?.is_correct
                                ? "Correct!"
                                : "Incorrect"}
                        </span>
                    </div>
                    {/* Show explanation if available */}
                    {currentQuestion.options.find(opt => opt.is_correct)
                        ?.explanation && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {
                                currentQuestion.options.find(
                                    opt => opt.is_correct
                                )?.explanation
                            }
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {!showResult ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOptionId || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-100"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </Button>
                ) : (
                    <>
                        {!isLastQuestion ? (
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Finish Session
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
