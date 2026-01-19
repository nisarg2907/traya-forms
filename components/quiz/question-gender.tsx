"use client";

import type { QuizQuestion } from "@/lib/use-quiz-data";
import { cn } from "@/lib/utils";

interface QuestionGenderProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function QuestionGender({
  question,
  value,
  onChange,
  onNext,
}: QuestionGenderProps) {
  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <h2 className="text-xl sm:text-[22px] font-semibold text-left w-full text-[#2d3748] mb-16">
        {question.question}
      </h2>

      <div className="flex gap-4 sm:gap-6 justify-center w-full">
        {question.options?.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "flex items-center justify-center py-4 px-8 sm:px-12 rounded-lg border transition-all min-w-[140px] sm:min-w-[160px] text-base font-medium",
                isSelected
                  ? "border-[#b8c9a3] bg-[#c5d4a8] text-[#2d3b2d]"
                  : "border-[#d1d5db] bg-white text-[#2d3748] hover:border-[#9ca3af]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
