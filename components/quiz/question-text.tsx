"use client";

import React from "react";
import { useState, useEffect } from "react";
import type { QuizQuestion } from "@/lib/quiz-data";

interface QuestionTextProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function QuestionText({
  question,
  value,
  onChange,
  onNext,
}: QuestionTextProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && localValue.trim()) {
      onChange(localValue);
      onNext();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  const isValid = localValue.trim().length > 0;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <h2 className="text-xl sm:text-[22px] font-semibold text-left w-full text-[#2d3748] mb-24">
        {question.question}
      </h2>

      <div className="w-full mb-12">
        <input
          type={question.id === "phone" ? "tel" : "text"}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          className="w-full bg-transparent border-0 border-b border-[#d1d5db] focus:border-[#2d3748] outline-none text-base py-3 px-0 text-[#2d3748] placeholder:text-[#9ca3af] transition-colors"
          autoFocus
        />
      </div>

      <button
        onClick={() => {
          if (isValid) {
            onChange(localValue);
            onNext();
          }
        }}
        disabled={!isValid}
        className="w-full max-w-[260px] bg-[#1e2a2d] text-white py-3.5 px-8 rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#2d3b40] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        NEXT
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>

      {question.disclaimer && (
        <p className="text-xs text-[#6b7280] text-center mt-12 max-w-lg leading-relaxed">
          {question.disclaimer}
          <a href="#" className="underline ml-0.5">
            Learn more
          </a>
        </p>
      )}
    </div>
  );
}
