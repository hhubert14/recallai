"use client";

import { ChevronDown, Layers, HelpCircle, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StudyMode } from "./types";

interface StudyDropdownProps {
    onSelect: (mode: StudyMode) => void;
    disabledModes?: StudyMode[];
    totalItems?: number;
}

const studyOptions: { mode: StudyMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
        mode: "flashcards",
        label: "Flashcards",
        description: "Study flashcards with self-assessment",
        icon: <Layers className="h-4 w-4" />,
    },
    {
        mode: "quiz",
        label: "Quiz",
        description: "Multiple choice questions",
        icon: <HelpCircle className="h-4 w-4" />,
    },
    {
        mode: "both",
        label: "Both",
        description: "Mixed flashcards and questions",
        icon: <Shuffle className="h-4 w-4" />,
    },
    {
        mode: "practice",
        label: "Practice",
        description: "Explain concepts with AI (Feynman Technique)",
        icon: <Sparkles className="h-4 w-4" />,
    },
];

export function StudyDropdown({ onSelect, disabledModes = [], totalItems }: StudyDropdownProps) {
    const isPracticeDisabled = totalItems !== undefined && totalItems < 5;
    const allDisabled = disabledModes.length === 3;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={allDisabled}>
                    Study
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {studyOptions.map((option) => {
                        const isDisabled = disabledModes.includes(option.mode) ||
                            (option.mode === "practice" && isPracticeDisabled);
                        const showTooltip = option.mode === "practice" && isPracticeDisabled;

                        const menuItem = (
                            <DropdownMenuItem
                                key={option.mode}
                                onClick={() => onSelect(option.mode)}
                                disabled={isDisabled}
                                className="flex items-start gap-3 py-2"
                            >
                                <span className="mt-0.5 text-muted-foreground">
                                    {option.icon}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {option.description}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        );

                        if (showTooltip) {
                            return (
                                <Tooltip key={option.mode}>
                                    <TooltipTrigger asChild>
                                        {/* Wrapper needed because disabled items have pointer-events:none */}
                                        <span className="block">{menuItem}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add more terms to unlock Practice mode (5+ needed)</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return menuItem;
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
