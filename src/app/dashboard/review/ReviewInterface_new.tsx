"use client";

import { useState } from "react";
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

export function ReviewInterface({ 
    userId, 
    reviewStats, 
    dueQuestions, 
    initialQuestions 
}: ReviewInterfaceProps) {
    // Combine all questions in a single array - due questions first, then initial
    const allQuestions = [...dueQuestions, ...initialQuestions];
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track which questions we're showing (due vs initial)
    const totalDueQuestions = dueQuestions.length;
    const isInDueMode = currentQuestionIndex < totalDueQuestions;
    const currentQuestion = allQuestions[currentQuestionIndex];

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
            is_correct: selectedOption.is_correct
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

    // Check if this is the last question
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
    
    // Find the selected option for result display
    const selectedOption = currentQuestion?.options.find(
        option => option.id === selectedOptionId
    );

    // Check if session is complete (beyond last question)
    const sessionComplete = currentQuestionIndex >= allQuestions.length;

    // Show session complete screen
    if (sessionComplete) {
        return (
            <div className="max-w-2xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900">{reviewStats.questionsDueToday}</p>
                        <p className="text-sm text-gray-600">Due Today</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-900">{reviewStats.totalQuestionsInSystem}</p>
                        <p className="text-sm text-gray-600">Total Questions</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-orange-900">{reviewStats.questionsInBox1}</p>
                        <p className="text-sm text-gray-600">Box 1 (Struggling)</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-purple-900">{reviewStats.questionsInBox5}</p>
                        <p className="text-sm text-gray-600">Box 5 (Mastered)</p>
                    </div>
                </div>

                {/* Session complete message */}
                <div className="text-center py-12 bg-green-50 rounded-lg">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">
                            🎉 Session Complete!
                        </h2>
                        <p className="text-gray-600">
                            Great job! You've completed all available questions. 
                            Reviewed questions will appear again based on their spaced repetition schedule.
                        </p>
                        <Button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700"
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900">{reviewStats.questionsDueToday}</p>
                        <p className="text-sm text-gray-600">Due Today</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-900">{reviewStats.totalQuestionsInSystem}</p>
                        <p className="text-sm text-gray-600">Total Questions</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-orange-900">{reviewStats.questionsInBox1}</p>
                        <p className="text-sm text-gray-600">Box 1 (Struggling)</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-purple-900">{reviewStats.questionsInBox5}</p>
                        <p className="text-sm text-gray-600">Box 5 (Mastered)</p>
                    </div>
                </div>

                {/* No questions message */}
                <div className="text-center py-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            No Questions Available
                        </h2>
                        <p className="text-gray-600">
                            You don't have any questions due for review today. 
                            Complete some video quizzes to add questions to your spaced repetition system.
                        </p>
                        <Button 
                            onClick={() => window.location.href = '/dashboard'}
                            variant="outline"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Main quiz interface
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">{reviewStats.questionsDueToday}</p>
                    <p className="text-sm text-gray-600">Due Today</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">{reviewStats.totalQuestionsInSystem}</p>
                    <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900">{reviewStats.questionsInBox1}</p>
                    <p className="text-sm text-gray-600">Box 1 (Struggling)</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">{reviewStats.questionsInBox5}</p>
                    <p className="text-sm text-gray-600">Box 5 (Mastered)</p>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                    {isInDueMode ? ' (Due Today)' : ' (Initial Review)'}
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentQuestion.question_text}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                        <label
                            key={option.id}
                            className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedOptionId === option.id
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            } ${
                                showResult
                                    ? option.is_correct
                                        ? "border-green-600 bg-green-50"
                                        : selectedOptionId === option.id && !option.is_correct
                                        ? "border-red-600 bg-red-50"
                                        : "border-gray-200 bg-gray-50"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="option"
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                onChange={() => !showResult && setSelectedOptionId(option.id)}
                                disabled={showResult}
                                className="sr-only"
                            />
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedOptionId === option.id
                                        ? "border-blue-600"
                                        : "border-gray-300"
                                }`}>
                                    {selectedOptionId === option.id && (
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    )}
                                </div>
                                <span className="text-gray-900">{option.option_text}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Result */}
            {showResult && (
                <div className={`p-4 rounded-lg ${
                    selectedOption?.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                    <div className="flex items-center mb-2">
                        <span className={`font-medium ${
                            selectedOption?.is_correct ? "text-green-800" : "text-red-800"
                        }`}>
                            {selectedOption?.is_correct ? "Correct!" : "Incorrect"}
                        </span>
                    </div>
                    {/* Show explanation if available */}
                    {currentQuestion.options.find(opt => opt.is_correct)?.explanation && (
                        <p className="text-sm text-gray-700">
                            {currentQuestion.options.find(opt => opt.is_correct)?.explanation}
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
                        className="bg-blue-600 hover:bg-blue-700"
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
