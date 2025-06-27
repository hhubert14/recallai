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
}: ReviewInterfaceProps) {    const [currentQuestions, setCurrentQuestions] = useState(dueQuestions);
    const [currentInitialQuestions, setCurrentInitialQuestions] = useState(initialQuestions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewMode, setReviewMode] = useState<'due' | 'initial'>(dueQuestions.length > 0 ? 'due' : 'initial');
    const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
    const [sessionComplete, setSessionComplete] = useState(false);

    // Determine which questions to show based on mode
    const questionsToShow = reviewMode === 'due' ? currentQuestions : currentInitialQuestions;
    const availableQuestions = questionsToShow.filter(q => !completedQuestions.includes(q.question_id));
    const currentQuestion = availableQuestions[currentQuestionIndex];    const handleSubmit = async () => {
        if (!selectedOptionId || !currentQuestion) return;

        setIsSubmitting(true);

        const selectedOption = currentQuestion.options.find(
            option => option.id === selectedOptionId
        );

        if (!selectedOption) return;

        // Process the answer for spaced repetition
        await processReviewAnswer({
            user_id: userId,
            question_id: currentQuestion.question_id,
            selected_option_id: selectedOptionId,
            is_correct: selectedOption.is_correct
        });

        // Mark this question as completed in this session
        setCompletedQuestions(prev => [...prev, currentQuestion.question_id]);

        setShowResult(true);
        setIsSubmitting(false);
    };    const handleNext = () => {
        setSelectedOptionId(null);
        setShowResult(false);

        // Check if there are more questions in current mode
        if (currentQuestionIndex < availableQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Finished all questions in current mode
            setCurrentQuestionIndex(0);
            
            // If we were in due mode and have initial questions, switch to initial
            if (reviewMode === 'due' && currentInitialQuestions.filter(q => !completedQuestions.includes(q.question_id)).length > 0) {
                setReviewMode('initial');
            } else {
                // No more questions available, mark session as complete
                setSessionComplete(true);
            }
        }
    };const handleStartInitial = () => {
        setReviewMode('initial');
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setShowResult(false);
    };    // Check if we have any questions available
    const hasQuestionsToShow = availableQuestions.length > 0;
    const hasMoreInCurrentMode = currentQuestionIndex < availableQuestions.length - 1;
    const canSwitchToInitial = reviewMode === 'due' && currentInitialQuestions.filter(q => !completedQuestions.includes(q.question_id)).length > 0;

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

    if (!hasQuestionsToShow) {
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

                {/* All caught up message */}
                <div className="text-center py-12 bg-green-50 rounded-lg">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">
                            🎉 You're all caught up!
                        </h2>                        <p className="text-gray-600">
                            No questions are due for review today. Great job staying on top of your studies!
                        </p>
                        {currentInitialQuestions.filter(q => !completedQuestions.includes(q.question_id)).length > 0 && (
                            <Button 
                                onClick={handleStartInitial}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Review New Questions ({currentInitialQuestions.filter(q => !completedQuestions.includes(q.question_id)).length} available)
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const selectedOption = currentQuestion.options.find(
        option => option.id === selectedOptionId
    );
    const correctOption = currentQuestion.options.find(option => option.is_correct);

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
            </div>            {/* Progress & Mode */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <span>
                    Question {currentQuestionIndex + 1} of {availableQuestions.length} 
                    {reviewMode === 'due' ? ' (Due Today)' : ' (Initial Review)'}
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / availableQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                        From: {currentQuestion.video_title} • Box {currentQuestion.box_level}
                    </p>
                    <h3 className="text-lg font-medium text-gray-900">
                        {currentQuestion.question_text}
                    </h3>
                </div>

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
                <div className={`p-4 rounded-lg mb-6 ${
                    selectedOption?.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                    <div className="flex items-center mb-2">
                        <span className={`font-medium ${
                            selectedOption?.is_correct ? "text-green-800" : "text-red-800"
                        }`}>
                            {selectedOption?.is_correct ? "Correct! ✓" : "Incorrect ✗"}
                        </span>
                    </div>
                    {correctOption?.explanation && (
                        <p className="text-sm text-gray-700">
                            {correctOption.explanation}
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
                ) : (                    <Button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {hasMoreInCurrentMode ? "Next Question" : 
                         canSwitchToInitial ? "Start Initial Review" : "Finish Session"}
                    </Button>
                )}
            </div>
        </div>
    );
}
