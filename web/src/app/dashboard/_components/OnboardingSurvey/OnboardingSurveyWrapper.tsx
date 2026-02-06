"use client";

import { useState, useEffect } from "react";
import { OnboardingSurveyModal } from "./OnboardingSurveyModal";

const STORAGE_KEY = "onboarding_survey_completed";

export function OnboardingSurveyWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSurveyStatus = async () => {
            if (localStorage.getItem(STORAGE_KEY) === "true") {
                setIsChecking(false);
                return;
            }

            try {
                const response = await fetch("/api/v1/onboarding-surveys/me");

                if (response.ok) {
                    // Survey exists, set localStorage and don't show modal
                    localStorage.setItem(STORAGE_KEY, "true");
                    setIsChecking(false);
                } else if (response.status === 404) {
                    setIsChecking(false);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Error checking survey status:", error);
                setIsChecking(false);
            }
        };

        checkSurveyStatus();
    }, []);

    const handleComplete = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsOpen(false);
    };

    if (isChecking) {
        return null;
    }

    return <OnboardingSurveyModal open={isOpen} onComplete={handleComplete} />;
}
