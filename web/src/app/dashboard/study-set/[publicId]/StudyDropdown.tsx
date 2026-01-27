"use client";

import { ChevronDown, Layers, HelpCircle, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudyMode } from "./types";

interface StudyDropdownProps {
    onSelect: (mode: StudyMode) => void;
    disabledModes?: StudyMode[];
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
];

export function StudyDropdown({ onSelect, disabledModes = [] }: StudyDropdownProps) {
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
                {studyOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.mode}
                        onClick={() => onSelect(option.mode)}
                        disabled={disabledModes.includes(option.mode)}
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
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
