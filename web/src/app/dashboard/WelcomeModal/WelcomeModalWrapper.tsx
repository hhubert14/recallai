"use client";

import { useState, useEffect } from "react";
import { WelcomeModal } from "./WelcomeModal";
import { STORAGE_KEY } from "./welcome-steps";
import { useExtensionDetection } from "@/hooks/useExtensionDetection";

export function WelcomeModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const {
    isInstalled: isExtensionInstalled,
    isChecking: isCheckingExtension,
    recheckInstallation,
  } = useExtensionDetection();

  useEffect(() => {
    // Check if already completed
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setIsChecking(false);
      return;
    }

    // Show modal
    setIsChecking(false);
    setIsOpen(true);
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (isChecking) {
    return null;
  }

  return (
    <WelcomeModal
      open={isOpen}
      onComplete={handleComplete}
      isExtensionInstalled={isExtensionInstalled}
      isCheckingExtension={isCheckingExtension}
      onRecheckExtension={recheckInstallation}
    />
  );
}
