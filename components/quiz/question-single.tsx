"use client";

import type { QuizQuestion } from "@/lib/use-quiz-data";
import { cn } from "@/lib/utils";

interface QuestionSingleProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function QuestionSingle({
  question,
  value,
  onChange,
  onNext,
}: QuestionSingleProps) {
  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      <h2 className="text-xl sm:text-[22px] font-semibold text-left text-[#2d3748] mb-8">
        {question.question}
      </h2>

      <div className="w-full">
        {question.options?.map((option, index) => {
          const isSelected = value === option.id;
          const isLast = index === (question.options?.length ?? 0) - 1;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "w-full flex items-start gap-4 py-4 text-left transition-all",
                !isLast && "border-b border-[#e5e7eb]"
              )}
            >
              {/* Radio circle */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  isSelected ? "border-[#8fa575]" : "border-[#9ca3af]"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8fa575]" />
                )}
              </div>
              
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-[15px] leading-snug",
                    isSelected ? "text-[#1e2a2d]" : "text-[#2d3748]"
                  )}
                >
                  {option.label}
                </span>
                {option.subLabel && (
                  <span className="text-xs text-[#9ca3af] italic leading-snug">
                    {option.subLabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
