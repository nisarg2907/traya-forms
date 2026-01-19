"use client";

import type { QuizQuestion } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";

interface QuestionImageProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function QuestionImage({
  question,
  value,
  onChange,
  onNext,
}: QuestionImageProps) {
  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-[22px] font-semibold text-left text-[#2d3748] mb-8">
        {question.question}
      </h2>

      <div className="flex w-[100%] pb-2 grid grid-cols-1 md:grid-cols-2 gap-1 mb-8 xl:mb-0 mx-auto">
        {question.options?.map((option) => {
          const isSelected = value === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "cursor-pointer flex flex-col items-between px-3 py-2 md:py-3 justify-center rounded-md text-left transition-all",
                "bg-[#f3f4f6]",
                isSelected && "ring-1 ring-[#8fa575]"
              )}
            >
              <div className="flex justify-between w-full">
                <div className="pl-0 w-[60%] inline-flex items-center">
                {/* Radio circle */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isSelected ? "border-[#8fa575]" : "border-[#9ca3af]"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8fa575]" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "md:whitespace-nowrap text-[16px] ml-1.5 pr-4 md:pr-2",
                      isSelected ? "text-[#1e2a2d]" : "text-[#2d3748]"
                    )}
                  >
                    {option.label}
                  </span>
                </div>
                {/* Images */}
                {option.images && option.images.length > 0 && (
                  <div className="flex w-[40%] justify-end items-end">
                    {option.images.map((imageUrl, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={imageUrl}
                        alt={option.label}
                        className={cn(
                          imgIndex === 0
                            ? "mr-2 border-r pr-4"
                            : "pl-2"
                        )}
                        width={imgIndex === 0 ? 70 : 80}
                        height={imgIndex === 0 ? 70 : 80}
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
