"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionDto, QuestionOptionDto } from "@/data-access/questions/types";
import { submitAnswer } from "./actions";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";

interface QuizInterfaceProps {
    questions: QuestionDto[];
    userId: string;
    videoId: number;
}

export function QuizInterface({ questions, userId, videoId }: QuizInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<QuestionOptionDto | null>(null);
    
    const { markVideoAsCompleted } = useQuizCompletion();

    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmit = async () => {
        if (!selectedOptionId) return;

        setIsSubmitting(true);

        const selectedOption = currentQuestion.options.find(
            option => option.id === selectedOptionId
        );

        if (!selectedOption) return;

        // Find the correct answer
        const correctOption = currentQuestion.options.find(option => option.is_correct);
        setCorrectAnswer(correctOption || null);        // Save user answer
        await submitAnswer({
            user_id: userId,
            question_id: currentQuestion.id,
            selected_option_id: selectedOptionId,
            is_correct: selectedOption.is_correct
        });        setShowResult(true);
        setIsSubmitting(false);
        
        // Mark video as completed if this is the last question
        if (currentQuestionIndex === questions.length - 1) {
            markVideoAsCompleted(videoId);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOptionId(null);
            setShowResult(false);
            setCorrectAnswer(null);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setShowResult(false);
        setCorrectAnswer(null);
    };

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const selectedOption = currentQuestion.options.find(
        option => option.id === selectedOptionId
    );

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
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
                    {correctAnswer?.explanation && (
                        <p className="text-sm text-gray-700">
                            {correctAnswer.explanation}
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
                                onClick={handleReset}
                                variant="outline"
                            >
                                Start Over
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
