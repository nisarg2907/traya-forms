"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  type SavedQuizState = {
    currentIndex: number;
    answers: Record<string, string | string[]>;
    updatedAt: number;
    // Indices of questions that have been completed (for step-wise progress tracking)
    completedQuestionIndices?: number[];
  };

  const savedStateRef = useRef<SavedQuizState | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentSection = getCurrentSection(currentIndex);
  const isLastQuestion = currentIndex === questions.length - 1;
  const isLastQuestionAnswered = isLastQuestion && answers[currentQuestion?.id] !== undefined;
  const progress = isComplete || isLastQuestionAnswered ? 100 : getSectionProgress(currentIndex);

  // Load saved quiz state from localStorage (up to 10 days old)
  // Only show resume prompt if user has reached at least section 2 (Hair Health)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("hairQuizState");
      if (!raw) return;

      const parsed = JSON.parse(raw) as SavedQuizState;
      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

      if (!parsed || typeof parsed.updatedAt !== "number") {
        window.localStorage.removeItem("hairQuizState");
        return;
      }

      const isFresh = Date.now() - parsed.updatedAt <= tenDaysMs;
      if (!isFresh) {
        window.localStorage.removeItem("hairQuizState");
        return;
      }

      // Only show resume prompt if user has progressed beyond the very first step
      // i.e. they have reached at least index 1 (second question or beyond)
      const hasReachedStage2 = parsed.currentIndex >= 1;
      
      if (hasReachedStage2) {
        // Save for later; we'll apply it only if user chooses to continue
        savedStateRef.current = parsed;
        setShowResumePrompt(true);
      } else {
        // If they haven't reached stage 2, clear the saved state and start fresh
        window.localStorage.removeItem("hairQuizState");
      }
    } catch {
      // If anything goes wrong, clear corrupted state
      try {
        window.localStorage.removeItem("hairQuizState");
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist quiz progress while user is taking the quiz
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (showResumePrompt) return;

    try {
      if (isComplete) {
        window.localStorage.removeItem("hairQuizState");
        return;
      }

      // Derive which steps/questions are completed:
      // - any question with an answer
      // - any question before the current index (user has moved past it)
      const completedQuestionIndices = questions
        .map((question, index) => {
          const hasAnswer = answers[question.id] !== undefined;
          const passedIndex = index < currentIndex;
          return hasAnswer || passedIndex ? index : null;
        })
        .filter((index): index is number => index !== null);

      const payload: SavedQuizState = {
        currentIndex,
        answers,
        updatedAt: Date.now(),
        completedQuestionIndices,
      };

      window.localStorage.setItem("hairQuizState", JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [currentIndex, answers, isComplete, showResumePrompt]);

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

  const handleStartFromBeginning = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsComplete(false);
    setShowResumePrompt(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("hairQuizState");
      } catch {
        // ignore
      }
    }
  }, []);

  const handleContinueQuiz = useCallback(() => {
    const saved = savedStateRef.current;
    if (!saved) {
      setShowResumePrompt(false);
      return;
    }

    setCurrentIndex(saved.currentIndex ?? 0);
    setAnswers(saved.answers ?? {});
    setIsComplete(false);
    setShowResumePrompt(false);
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
        {showResumePrompt ? (
          <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-8 pb-12 font-sans">
            <div className="block mx-auto max-w-2xl p-6 bg-white my-8">
              <div className="flex flex-col items-center justify-center gap-4 h-2/5 sm:h-auto">
                <h2 className="text-2xl font-bold text-center sm:text-4xl lg:text-6xl text-gray-600">
                  Hey There!
                </h2>
                <h4 className="font-bold text-center sm:text-2xl text-gray-700">
                  You have taken the Traya hair test before.
                </h4>
                <button
                  type="button"
                  onClick={handleStartFromBeginning}
                  className="w-[85%] md:w-[70%] justify-center flex bg-[#414042] text-white py-2.5 px-4 text-[16px] md:text-xl lg:text-xl xl:text-xl font-bold rounded-lg uppercase"
                >
                  <span className="font-[400] uppercase text-center">
                    Start from beginning
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleContinueQuiz}
                  className="w-[85%] md:w-[70%] justify-center flex bg-[#414042] text-white py-2.5 px-4 text-[16px] md:text-xl lg:text-xl xl:text-xl font-bold rounded-lg uppercase"
                >
                  <span className="font-[400] uppercase text-center">
                    Continue where I left
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
