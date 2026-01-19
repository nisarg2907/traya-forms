"use client";

import { useState, useCallback } from "react";
import {
  questions,
  getSectionProgress,
  getCurrentSection,
} from "@/lib/quiz-data";
import { QuizHeader } from "./quiz-header";
import { SectionTabs } from "./section-tabs";
import { QuestionText } from "./question-text";
import { QuestionGender } from "./question-gender";
import { QuestionSingle } from "./question-single";
import { QuestionImage } from "./question-image";
import { QuestionUpload } from "./question-upload";
import { QuizResults } from "./quiz-results";

export function HairQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentSection = getCurrentSection(currentIndex);
  const isLastQuestion = currentIndex === questions.length - 1;
  const isLastQuestionAnswered = isLastQuestion && answers[currentQuestion?.id] !== undefined;
  const progress = isComplete || isLastQuestionAnswered ? 100 : getSectionProgress(currentIndex);

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    },
    [currentQuestion?.id]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleExit = useCallback(() => {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      setCurrentIndex(0);
      setAnswers({});
      setIsComplete(false);
    }
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsComplete(false);
  }, []);

  const renderQuestion = () => {
    if (isComplete) {
      return <QuizResults answers={answers} onRestart={handleRestart} />;
    }

    const value = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "text":
        return (
          <QuestionText
            question={currentQuestion}
            value={(value as string) || ""}
            onChange={handleAnswer}
            onNext={handleNext}
          />
        );
      case "gender":
        return (
          <QuestionGender
            question={currentQuestion}
            value={(value as string) || ""}
            onChange={handleAnswer}
            onNext={handleNext}
          />
        );
      case "single":
        return (
          <QuestionSingle
            question={currentQuestion}
            value={(value as string) || ""}
            onChange={handleAnswer}
            onNext={handleNext}
          />
        );
      case "image":
        return (
          <QuestionImage
            question={currentQuestion}
            value={(value as string) || ""}
            onChange={handleAnswer}
            onNext={handleNext}
          />
        );
      case "upload":
        return (
          <QuestionUpload
            question={currentQuestion}
            onNext={handleNext}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <QuizHeader />

      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pt-4">
          {/* Previous / Exit row */}
          <div className="flex items-center justify-between mb-4">
            {currentIndex > 0 && !isComplete ? (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1.5 text-[#414042] hover:text-[#1a202c] text-sm font-[700] underline underline-offset-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                Previous
              </button>
            ) : (
              <div />
            )}
            {!isComplete && (
              <button
                onClick={handleExit}
                className="text-[#414042] hover:text-[#2d3748] text-sm font-[700] underline underline-offset-2"
              >
                Exit
              </button>
            )}
          </div>

          <SectionTabs
            currentSection={currentSection}
            progress={progress}
          />
        </div>

        <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-8 pb-12">
          <div
            key={currentIndex}
            className="w-full animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {renderQuestion()}
          </div>
        </div>
      </main>
    </div>
  );
}
