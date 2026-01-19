"use client";

import React from "react";
import { useState, useEffect } from "react";
import type { QuizQuestion } from "@/lib/use-quiz-data";

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
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
    // Hide validation message when user changes input
    if (hasAttemptedNext) {
      setHasAttemptedNext(false);
    }
  };

  const trimmed = localValue.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  const hasNonNumeric = trimmed.length > 0 && trimmed !== digitsOnly;

  let isValid = trimmed.length > 0;

  if (question.id === "phone") {
    // Phone must be exactly 10 digits
    const isTenDigits = digitsOnly.length === 10;
    isValid = isTenDigits && !hasNonNumeric;
  } else if (question.id === "age") {
    // Age must be a number < 100
    const ageNumber = Number(digitsOnly);
    isValid = digitsOnly.length > 0 && ageNumber > 0 && ageNumber < 100 && !hasNonNumeric;
  } else {
    isValid = trimmed.length > 0;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setHasAttemptedNext(true);
      if (isValid) {
        onChange(localValue);
        onNext();
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <h2 className="text-xl sm:text-[22px] font-semibold text-left w-full text-[#2d3748] mb-24">
        {question.question}
      </h2>

      <div className="w-full mb-12">
        <input
          type={question.id === "phone" || question.id === "age" ? "tel" : "text"}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          className={`w-full bg-transparent border-0 border-b outline-none text-base py-3 px-0 text-[#2d3748] placeholder:text-[#9ca3af] transition-colors ${
            hasAttemptedNext ? "border-[#9bb96f]" : "border-[#d1d5db]"
          }`}
          autoFocus
        />
        {question.id === "phone" && hasAttemptedNext && !isValid && (
          <p className="mt-2 text-sm text-[#9bb96f]">
            {hasNonNumeric
              ? "Numbers only please"
              : "Please enter a valid 10 digit mobile number"}
          </p>
        )}
        {question.id === "age" && hasAttemptedNext && !isValid && (
          <p className="mt-2 text-sm text-[#9bb96f]">
            {hasNonNumeric
              ? "Numbers only please"
              : "Please enter age <100"}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          setHasAttemptedNext(true);
          if (isValid) {
            onChange(localValue);
            onNext();
          }
        }}
        className="w-full max-w-[260px] bg-[#1e2a2d] text-white py-3.5 px-8 rounded-full font-medium text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-[#2d3b40] transition-all"
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
