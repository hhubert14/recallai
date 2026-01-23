"use client";

import { useState, useEffect, useCallback } from "react";
import { getExtensionId } from "@/config/extension";

type UseExtensionDetectionReturn = {
  isInstalled: boolean;
  isChecking: boolean;
  recheckInstallation: () => void;
};

const TIMEOUT_MS = 500;

export function useExtensionDetection(): UseExtensionDetectionReturn {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkExtension = useCallback(() => {
    setIsChecking(true);

    // Handle SSR and missing chrome API
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      setIsInstalled(false);
      setIsChecking(false);
      return;
    }

    const extensionId = getExtensionId();
    let timeoutId: ReturnType<typeof setTimeout>;
    let completed = false;

    const complete = (installed: boolean) => {
      if (completed) return;
      completed = true;
      clearTimeout(timeoutId);
      setIsInstalled(installed);
      setIsChecking(false);
    };

    // Set timeout for non-response
    timeoutId = setTimeout(() => {
      complete(false);
    }, TIMEOUT_MS);

    try {
      chrome.runtime.sendMessage(
        extensionId,
        { action: "ping" },
        (response: unknown) => {
          // Check for errors
          if (chrome.runtime.lastError) {
            complete(false);
            return;
          }

          // Check for successful response
          const isSuccess =
            response !== null &&
            typeof response === "object" &&
            "success" in response &&
            (response as { success: boolean }).success === true;

          complete(isSuccess);
        }
      );
    } catch {
      complete(false);
    }
  }, []);

  useEffect(() => {
    checkExtension();
  }, [checkExtension]);

  const recheckInstallation = useCallback(() => {
    checkExtension();
  }, [checkExtension]);

  return {
    isInstalled,
    isChecking,
    recheckInstallation,
  };
}
