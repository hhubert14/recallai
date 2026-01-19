"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizCompletion } from "@/components/providers/QuizCompletionProvider";
import { useVideoPlayer } from "./VideoPlayerContext";

type QuestionWithOptions = {
    id: number;
    videoId: number;
    questionText: string;
    questionType: string;
    sourceTimestamp: number | null;
    options: {
        id: number;
        optionText: string;
        isCorrect: boolean;
        explanation: string | null;
    }[];
};

type QuestionOption = {
    id: number;
    optionText: string;
    isCorrect: boolean;
    explanation: string | null;
};

interface QuizInterfaceProps {
    questions: QuestionWithOptions[];
    // userId: string;
    videoId: number;
}

function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
    if (array.length <= 1) return [...array];

    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to shuffle questions and their options
function shuffleQuestionsAndOptions(questions: QuestionWithOptions[]): QuestionWithOptions[] {
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.map(question => ({
        ...question,
        options: shuffleArray(question.options),
    }));
}

export function QuizInterface({
    questions,
    // userId,
    videoId,
}: QuizInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
        null
    );
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [correctAnswer, setCorrectAnswer] =
        useState<QuestionOption | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<QuestionWithOptions[]>(
        []
    );

    const { markVideoAsCompleted } = useQuizCompletion();
    const { seekTo } = useVideoPlayer();

    // Shuffle questions and their options when component mounts or questions change
    useEffect(() => {
        if (questions.length > 0) {
            const shuffled = shuffleQuestionsAndOptions(questions);
            setShuffledQuestions(shuffled);
        }
    }, [questions]);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    // Don't render if questions are not yet shuffled
    if (!currentQuestion || shuffledQuestions.length === 0) {
        return <div className="text-center py-8">Loading quiz...</div>;
    }

    const handleSubmit = async () => {
        if (!selectedOptionId) return;

        setIsSubmitting(true);

        const selectedOption = currentQuestion.options.find(
            option => option.id === selectedOptionId
        );

        if (!selectedOption) return;

        const correctOption = currentQuestion.options.find(
            option => option.isCorrect
        );
        setCorrectAnswer(correctOption || null);

        await fetch("/api/v1/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: currentQuestion.id,
                selectedOptionId: selectedOptionId,
                isCorrect: selectedOption.isCorrect,
            }),
        });

        setShowResult(true);
        setIsSubmitting(false);

        // Mark video as completed if this is the last question
        if (currentQuestionIndex === shuffledQuestions.length - 1) {
            markVideoAsCompleted(videoId);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
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

    const isLastQuestion =
        currentQuestionIndex === shuffledQuestions.length - 1;
    const selectedOption = currentQuestion.options.find(
        option => option.id === selectedOptionId
    );

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Question {currentQuestionIndex + 1} of{" "}
                    {shuffledQuestions.length}
                </span>
                <div className="w-32 bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-muted p-6 rounded-lg border border-border">
                <div className="flex items-start gap-2 mb-4">
                    <h3 className="text-lg font-medium text-foreground flex-1">
                        {currentQuestion.questionText}
                    </h3>
                    {currentQuestion.sourceTimestamp !== null && (
                        <button
                            onClick={() => seekTo(currentQuestion.sourceTimestamp!)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded cursor-pointer transition-colors"
                            title={`Jump to ${formatTimestamp(currentQuestion.sourceTimestamp)}`}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            {formatTimestamp(currentQuestion.sourceTimestamp)}
                        </button>
                    )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map(option => (
                        <label
                            key={option.id}
                            className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedOptionId === option.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground/50"
                            } ${
                                showResult
                                    ? option.isCorrect
                                        ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : selectedOptionId === option.id &&
                                            !option.isCorrect
                                          ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                                          : "border-border bg-muted"
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
                                            ? "border-primary"
                                            : "border-muted-foreground/50"
                                    }`}
                                >
                                    {selectedOptionId === option.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </div>
                                <span className="text-foreground">
                                    {option.optionText}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Result */}
            {showResult && (
                <div
                    className={`p-4 rounded-lg animate-fade-up ${
                        selectedOption?.isCorrect
                            ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                    }`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        {selectedOption?.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span
                            className={`font-medium ${
                                selectedOption?.isCorrect
                                    ? "text-green-800 dark:text-green-100"
                                    : "text-red-800 dark:text-red-100"
                            }`}
                        >
                            {selectedOption?.isCorrect
                                ? "Correct!"
                                : "Incorrect"}
                        </span>
                    </div>
                    {correctAnswer?.explanation && (
                        <p className="text-sm text-muted-foreground">
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
                    >
                        {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </Button>
                ) : (
                    <>
                        {!isLastQuestion ? (
                            <Button onClick={handleNext}>
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
