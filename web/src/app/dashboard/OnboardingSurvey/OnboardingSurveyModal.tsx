"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SurveyQuestion } from "./SurveyQuestion";
import { SURVEY_QUESTIONS } from "./survey-questions";
import { Loader2 } from "lucide-react";
import { SurveyAnswers } from "@/clean-architecture/domain/entities/onboarding-survey.entity";

type OnboardingSurveyModalProps = {
    open: boolean;
    onComplete: () => void;
};

export function OnboardingSurveyModal({
    open,
    onComplete,
}: OnboardingSurveyModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<
        Record<string, { selected: string | string[]; other?: string }>
    >({});
    const [otherValues, setOtherValues] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = SURVEY_QUESTIONS.length;
    const currentQuestion = SURVEY_QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleAnswer = (value: string | string[]) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: {
                selected: value,
                other: otherValues[currentQuestion.id] || undefined,
            },
        }));
    };

    const handleOtherChange = (value: string) => {
        setOtherValues((prev) => ({
            ...prev,
            [currentQuestion.id]: value,
        }));
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: {
                ...prev[currentQuestion.id],
                selected: prev[currentQuestion.id]?.selected || [],
                other: value,
            },
        }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const submitSurvey = async (surveyAnswers: SurveyAnswers) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/v1/onboarding-surveys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: surveyAnswers }),
            });

            if (response.ok) {
                onComplete();
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = () => {
        submitSurvey(answers as SurveyAnswers);
    };

    const handleSkip = () => {
        submitSurvey({});
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Help us personalize your experience</DialogTitle>
                    <DialogDescription>
                        Answer a few quick questions to help us improve RecallAI
                        for you. Your responses are confidential and used only
                        to enhance your learning experience.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress bar */}
                <div className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-muted-foreground mb-4 text-xs">
                    Question {currentStep + 1} of {totalSteps}
                </p>

                {/* Current question */}
                <SurveyQuestion
                    questionNumber={currentStep + 1}
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    selected={answers[currentQuestion.id]?.selected || null}
                    onSelect={handleAnswer}
                    multiSelect={currentQuestion.multiSelect}
                    showOther={currentQuestion.showOther}
                    otherValue={otherValues[currentQuestion.id] || ""}
                    onOtherChange={handleOtherChange}
                />

                <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="text-muted-foreground"
                    >
                        Skip survey
                    </Button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={isSubmitting}
                            >
                                Previous
                            </Button>
                        )}

                        {currentStep < totalSteps - 1 ? (
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
