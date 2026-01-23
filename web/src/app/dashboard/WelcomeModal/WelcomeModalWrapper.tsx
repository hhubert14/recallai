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
    const completed = localStorage.getItem(STORAGE_KEY) === "true";
    if (!completed) {
      setIsOpen(true);
    }
    setIsChecking(false);
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
