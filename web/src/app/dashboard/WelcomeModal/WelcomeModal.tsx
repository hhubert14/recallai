"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  Chrome,
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
  Sparkles,
  Chrome,
} as const;

export function WelcomeModal({
  open,
  onComplete,
  isExtensionInstalled,
  isCheckingExtension,
  onRecheckExtension,
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showNotDetectedError, setShowNotDetectedError] = useState(false);
  const [recheckCount, setRecheckCount] = useState(0);

  // Show inline error when manual recheck completes and extension is still not installed
  useEffect(() => {
    if (recheckCount > 0 && !isCheckingExtension && !isExtensionInstalled) {
      setShowNotDetectedError(true);
    }
  }, [recheckCount, isCheckingExtension, isExtensionInstalled]);

  // Clear error when extension is installed
  useEffect(() => {
    if (isExtensionInstalled) {
      setShowNotDetectedError(false);
    }
  }, [isExtensionInstalled]);

  const handleRecheckExtension = () => {
    setShowNotDetectedError(false);
    setRecheckCount((c) => c + 1);
    onRecheckExtension();
  };

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
          <DialogTitle>Welcome to Retenio!</DialogTitle>
          <DialogDescription>
            Let&apos;s get you set up to learn smarter.
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

          {/* Welcome step - show bullets */}
          {currentStepData.id === "welcome" &&
            "bullets" in currentStepData &&
            currentStepData.bullets && (
              <ul className="text-muted-foreground space-y-2 text-left">
                {currentStepData.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <Check className="size-5 shrink-0 text-green-600 dark:text-green-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

          {/* Chrome extension step - show description + install UI */}
          {currentStepData.id === "chrome-extension" && (
            <>
              <p className="text-muted-foreground mb-4">
                {currentStepData.description}
              </p>

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
                    {"actionUrl" in currentStepData && (
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <a
                          href={currentStepData.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 size-4" />
                          {"actionLabel" in currentStepData &&
                            currentStepData.actionLabel}
                        </a>
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={handleRecheckExtension}
                      className="text-sm text-muted-foreground underline hover:text-foreground"
                    >
                      Check again
                    </button>
                    {showNotDetectedError && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Extension not detected. Please install and try again.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {isFirstStep ? (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="ghost" onClick={handleComplete}>
                Skip for now
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
