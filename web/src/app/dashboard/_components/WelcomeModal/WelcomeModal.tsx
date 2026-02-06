"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingAwareDialog } from "@/components/ui/loading-aware-dialog";
import { Button } from "@/components/ui/button";
import { WELCOME_STEPS } from "./welcome-steps";
import { AddVideoModal } from "@/components/AddVideoModal";
import { CreateStudySetModal } from "@/components/CreateStudySetModal";
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
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showCreateStudySetModal, setShowCreateStudySetModal] = useState(false);

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

  // Always use all 5 steps (no conditional logic)
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

  const Icon = currentStepData.icon ? ICONS[currentStepData.icon] : null;

  return (
    <LoadingAwareDialog
      open={open}
      isLoading={isCheckingExtension}
      onOpenChange={(isOpen) => !isOpen && handleComplete()}
    >
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
        <div className="flex flex-col items-center text-center">
          {Icon && (
            <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900">
              <Icon className="size-8 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>

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

          {/* Pin extension step - show video demo */}
          {currentStepData.id === "pin-extension" && (
            <>
              <p className="text-muted-foreground mb-6">
                {currentStepData.description}
              </p>
              <video
                data-testid="pin-extension-video"
                src="/pin-extension.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Demo showing how to pin the Retenio extension in Chrome"
                className="w-full max-w-md rounded-lg border border-border"
              />
            </>
          )}

          {/* Extension demo step - show video demo */}
          {currentStepData.id === "extension-demo" && (
            <>
              <p className="text-muted-foreground mb-6">
                {currentStepData.description}
              </p>
              <video
                data-testid="extension-demo-video"
                src="/extension-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Demo showing the Retenio extension in action"
                className="w-full max-w-md rounded-lg border border-border"
              />
            </>
          )}

          {/* Create first study set step - show description */}
          {currentStepData.id === "create-first-study-set" && (
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          {/* Back button - shown on all steps except the first */}
          {!isFirstStep ? (
            <Button variant="outline" onClick={handlePrevious}>
              Back
            </Button>
          ) : (
            <div /> // Spacer to maintain layout
          )}

          {isLastStep ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => setShowAddVideoModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Import from YouTube
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateStudySetModal(true)}
                >
                  Create Manually
                </Button>
              </div>
              <Button variant="ghost" onClick={handleComplete} className="text-sm">
                Skip for now
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Modals for step 5 CTAs */}
      <AddVideoModal
        isOpen={showAddVideoModal}
        onClose={() => setShowAddVideoModal(false)}
        onSuccess={() => {
          setShowAddVideoModal(false);
          onComplete();
        }}
      />
      <CreateStudySetModal
        isOpen={showCreateStudySetModal}
        onClose={() => setShowCreateStudySetModal(false)}
        onSuccess={() => {
          setShowCreateStudySetModal(false);
          onComplete();
        }}
      />
    </LoadingAwareDialog>
  );
}
