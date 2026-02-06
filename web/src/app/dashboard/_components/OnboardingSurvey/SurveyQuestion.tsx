"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionOption } from "./survey-questions";

type SurveyQuestionProps = {
  questionNumber: number;
  question: string;
  options: QuestionOption[];
  selected: string | string[] | null;
  onSelect: (value: string | string[]) => void;
  multiSelect?: boolean;
  showOther?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
};

export function SurveyQuestion({
  questionNumber,
  question,
  options,
  selected,
  onSelect,
  multiSelect = false,
  showOther = false,
  otherValue = "",
  onOtherChange,
}: SurveyQuestionProps) {
  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      if (currentSelected.includes(value)) {
        onSelect(currentSelected.filter((v) => v !== value));
      } else {
        onSelect([...currentSelected, value]);
      }
    } else {
      onSelect(value);
    }
  };

  const isSelected = (value: string): boolean => {
    if (multiSelect) {
      return Array.isArray(selected) && selected.includes(value);
    }
    return selected === value;
  };

  return (
    <div className="space-y-4">
      <Label className="text-foreground text-base font-medium">
        {questionNumber}. {question}
        {multiSelect && (
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            (Select all that apply)
          </span>
        )}
      </Label>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleOptionClick(option.value)}
            className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition-all ${
              isSelected(option.value)
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-5 items-center justify-center border-2 ${
                  multiSelect ? "rounded-md" : "rounded-full"
                } ${
                  isSelected(option.value)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {isSelected(option.value) && (
                  <svg
                    className="size-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28a.75.75 0 00-1.06 0L4.5 7l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06z" />
                  </svg>
                )}
              </div>
              <span className="text-foreground text-sm">{option.label}</span>
            </div>
          </button>
        ))}

        {showOther && (
          <div className="mt-3">
            <Input
              placeholder="Other (please specify)"
              value={otherValue}
              onChange={(e) => onOtherChange?.(e.target.value)}
              className="mt-1"
              maxLength={500}
            />
          </div>
        )}
      </div>
    </div>
  );
}
