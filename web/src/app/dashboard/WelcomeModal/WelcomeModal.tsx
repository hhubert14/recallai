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
import { WELCOME_STEPS } from "./welcome-steps";
import {
  Puzzle,
  Play,
  Brain,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

type WelcomeModalProps = {
  open: boolean;
  onComplete: () => void;
  isExtensionInstalled: boolean;
  isCheckingExtension: boolean;
  onRecheckExtension: () => void;
};

const ICONS = {
  Puzzle,
  Play,
  Brain,
} as const;

export function WelcomeModal({
  open,
  onComplete,
  isExtensionInstalled,
  isCheckingExtension,
  onRecheckExtension,
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = WELCOME_STEPS.length;
  const currentStepData = WELCOME_STEPS[currentStep];
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const Icon = ICONS[currentStepData.icon];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleComplete()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Welcome to RecallAI!</DialogTitle>
          <DialogDescription>
            Transform video watching into active learning in 3 simple steps.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mb-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"
        >
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          Step {currentStep + 1} of {totalSteps}
        </p>

        {/* Step content */}
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900">
            <Icon className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{currentStepData.title}</h3>
          <p className="text-muted-foreground mb-4">
            {currentStepData.description}
          </p>

          {/* Extension status (only on step 1) */}
          {currentStepData.id === "install-extension" && (
            <div className="mt-2">
              {isCheckingExtension ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Checking extension status...</span>
                </div>
              ) : isExtensionInstalled ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="size-5" />
                  <span>Extension installed!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a
                      href={currentStepData.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 size-4" />
                      {currentStepData.actionLabel}
                    </a>
                  </Button>
                  <button
                    type="button"
                    onClick={onRecheckExtension}
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                  >
                    Check again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {isLastStep ? (
              <Button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Got it
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
