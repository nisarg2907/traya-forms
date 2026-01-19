"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuizData, getSectionProgress, getCurrentSection, type Category } from "@/lib/use-quiz-data";
import { QuizHeader } from "./quiz-header";
import { SectionTabs } from "./section-tabs";
import { QuestionText } from "./question-text";
import { QuestionGender } from "./question-gender";
import { QuestionSingle } from "./question-single";
import { QuestionImage } from "./question-image";
import { QuestionUpload } from "./question-upload";
import { QuizResults } from "./quiz-results";

type SavedQuizState = {
  answers: Record<string, string | string[]>; // Only what's sent to API
  updatedAt: number; // For expiry check (10 days)
};

// Helper function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === "undefined") {
    console.log("[localStorage] window is undefined (SSR)");
    return false;
  }
  
  try {
    const test = "__localStorage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    console.log("[localStorage] ✅ Available and working");
    return true;
  } catch (error) {
    console.error("[localStorage] ❌ Not available:", error);
    return false;
  }
};

// Safe localStorage getter
const safeGetItem = (key: string): string | null => {
  console.log(`[localStorage] Getting item: ${key}`);
  
  if (!isLocalStorageAvailable()) {
    console.warn(`[localStorage] ⚠️ Cannot get ${key} - localStorage not available`);
    return null;
  }
  
  try {
    const value = window.localStorage.getItem(key);
    console.log(`[localStorage] ✅ Got ${key}:`, value ? `${value.substring(0, 50)}...` : "null");
    return value;
  } catch (error) {
    console.error(`[localStorage] ❌ Error getting ${key}:`, error);
    return null;
  }
};

// Safe localStorage setter
const safeSetItem = (key: string, value: string): boolean => {
  console.log(`[localStorage] Setting item: ${key}`, `(value length: ${value.length})`);
  
  if (!isLocalStorageAvailable()) {
    console.warn(`[localStorage] ⚠️ Cannot set ${key} - localStorage not available`);
    return false;
  }
  
  try {
    window.localStorage.setItem(key, value);
    console.log(`[localStorage] ✅ Successfully set ${key}`);
    return true;
  } catch (error) {
    console.error(`[localStorage] ❌ Error setting ${key}:`, error);
    // Check if it's a quota error
    if (error instanceof DOMException && error.code === 22) {
      console.error(`[localStorage] 💾 Storage quota exceeded!`);
    }
    return false;
  }
};

// Safe localStorage remover
const safeRemoveItem = (key: string): boolean => {
  console.log(`[localStorage] Removing item: ${key}`);
  
  if (!isLocalStorageAvailable()) {
    console.warn(`[localStorage] ⚠️ Cannot remove ${key} - localStorage not available`);
    return false;
  }
  
  try {
    window.localStorage.removeItem(key);
    console.log(`[localStorage] ✅ Successfully removed ${key}`);
    return true;
  } catch (error) {
    console.error(`[localStorage] ❌ Error removing ${key}:`, error);
    return false;
  }
};

export function HairQuiz() {
  const { questions, categories, loading, error } = useQuizData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showAlreadyCompleted, setShowAlreadyCompleted] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const savedStateRef = useRef<SavedQuizState | null>(null);

  // On mount, if the quiz was submitted in this browser, show the completed screen
  useEffect(() => {
    const submitted = safeGetItem("hairQuizSubmitted");
    if (submitted === "true") {
      setShowAlreadyCompleted(true);
    }
  }, []);

  // Load saved quiz state from localStorage (up to 10 days old)
  // Only show resume prompt if user has reached at least section 2 (Hair Health)
  useEffect(() => {
    if (questions.length === 0) return;

    // If quiz is already submitted in this browser, don't show resume prompt
    const submitted = safeGetItem("hairQuizSubmitted");
    if (submitted === "true") return;

    const raw = safeGetItem("hairQuizState");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SavedQuizState;
      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

      if (!parsed || typeof parsed.updatedAt !== "number" || !parsed.answers) {
        safeRemoveItem("hairQuizState");
        return;
      }

      const isFresh = Date.now() - parsed.updatedAt <= tenDaysMs;
      if (!isFresh) {
        safeRemoveItem("hairQuizState");
        return;
      }

      // Derive currentIndex from answers (find first unanswered question)
      let firstUnansweredIndex = questions.length;
      for (let i = 0; i < questions.length; i++) {
        if (!parsed.answers[questions[i].id]) {
          firstUnansweredIndex = i;
          break;
        }
      }

      // Check if user has any answers saved
      const hasAnyAnswers = Object.keys(parsed.answers).length > 0;
      
      // Only show resume prompt if user has progressed beyond the very first step
      // i.e. they have reached at least index 1 (second question or beyond)
      const hasReachedStage2 = firstUnansweredIndex >= 1;
      
      if (hasReachedStage2) {
        // Save for later; we'll apply it only if user chooses to continue
        savedStateRef.current = {
          answers: parsed.answers,
          updatedAt: parsed.updatedAt,
        };
        setShowResumePrompt(true);
      } else if (hasAnyAnswers) {
        // If they have answers but haven't reached stage 2, automatically restore them
        // This handles the case where user answered the first question and refreshed
        console.log("[Quiz] Auto-restoring saved answers (early stage)");
        setAnswers(parsed.answers);
        setCurrentIndex(firstUnansweredIndex);
        // Don't remove the state - keep it so progress is preserved
      } else {
        // No answers at all, safe to clear
        safeRemoveItem("hairQuizState");
      }
    } catch (error) {
      // If anything goes wrong, clear corrupted state
      if (process.env.NODE_ENV === "development") {
        console.error("Error parsing saved quiz state:", error);
      }
      safeRemoveItem("hairQuizState");
    }
  }, [questions]);

  // Persist quiz progress while user is taking the quiz
  // Only store answers (what's sent to API) and updatedAt (for expiry)
  useEffect(() => {
    if (showResumePrompt) return;

    if (isComplete) {
      safeRemoveItem("hairQuizState");
      return;
    }

    // Only store what's sent to API: answers
    const payload: SavedQuizState = {
      answers,
      updatedAt: Date.now(),
    };

    safeSetItem("hairQuizState", JSON.stringify(payload));
  }, [answers, isComplete, showResumePrompt]);

  // Compute derived values (safe even if questions is empty)
  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const isLastQuestionAnswered = isLastQuestion && currentQuestion && answers[currentQuestion.id] !== undefined;
  
  // When showing "Already Completed", show 100% progress and last section
  const progress = showAlreadyCompleted || isComplete || isLastQuestionAnswered ? 100 : questions.length > 0 ? getSectionProgress(currentIndex, questions.length) : 0;
  const currentSection = showAlreadyCompleted 
    ? (categories.length > 0 ? categories[categories.length - 1].order : 4)
    : questions.length > 0 ? getCurrentSection(currentIndex, questions) : 1;

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      if (!currentQuestion) return;
      
      // Clear "already completed" message if user changes phone number
      if (currentQuestion.id === "phone") {
        setShowAlreadyCompleted(false);
      }
      
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    },
    [currentQuestion?.id]
  );

  const submitForm = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;

    // Extract phone number from answers
    // Find the question with id "phone" or check answers directly
    const phone = answers["phone"] as string | undefined;
    
    if (!phone) {
      console.error("Phone number is required to submit the form");
      return;
    }

    // Extract name and email if available
    const name = answers["name"] as string | undefined;
    const email = answers["email"] as string | undefined;

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          email,
          answers,
        }),
      });

      // Clear localStorage after successful submission
      if (response.ok) {
        safeRemoveItem("hairQuizState");
        // Also clear quizSessionId if it exists
        safeRemoveItem("quizSessionId");
        // Mark quiz as submitted in this browser
        safeSetItem("hairQuizSubmitted", "true");
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  }, [answers]);

  const handleNext = useCallback(async () => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentIndex];
    
    // Check if this is the phone question and user has entered a phone number
    if (currentQuestion?.id === "phone" && answers["phone"]) {
      const phone = answers["phone"] as string;
      const digitsOnly = phone.replace(/\D/g, "");
      
      // Only check if phone is valid (10 digits)
      if (digitsOnly.length === 10) {
        setIsCheckingUser(true);
        setShowAlreadyCompleted(false);
        
        try {
          const response = await fetch(`/api/users/check?phone=${encodeURIComponent(digitsOnly)}`);
          const data = await response.json();
          
          if (data.hasCompleted) {
            // User has already completed the quiz
            setShowAlreadyCompleted(true);
            setIsCheckingUser(false);
            return; // Don't proceed to next question
          }
        } catch (error) {
          console.error("Failed to check user:", error);
          // Continue anyway if check fails
        } finally {
          setIsCheckingUser(false);
        }
      }
    }
    
    // Proceed to next question or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
      // Submit form when quiz is complete
      submitForm();
    }
  }, [currentIndex, questions, answers, submitForm]);

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
    setShowAlreadyCompleted(false);
    safeRemoveItem("hairQuizState");
    safeRemoveItem("hairQuizSubmitted");
    safeRemoveItem("quizSessionId");
  }, []);

  const handleContinueQuiz = useCallback(() => {
    const saved = savedStateRef.current;
    if (!saved || questions.length === 0) {
      setShowResumePrompt(false);
      return;
    }

    // Derive currentIndex from answers (find first unanswered question)
    let firstUnansweredIndex = questions.length;
    for (let i = 0; i < questions.length; i++) {
      if (!saved.answers[questions[i].id]) {
        firstUnansweredIndex = i;
        break;
      }
    }

    setCurrentIndex(firstUnansweredIndex);
    setAnswers(saved.answers ?? {});
    setIsComplete(false);
    setShowResumePrompt(false);
  }, [questions]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <QuizHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8fa575] mx-auto mb-4"></div>
            <p className="text-[#6b7280]">Loading quiz...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <QuizHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading quiz: {error || "No questions found"}</p>
            <p className="text-[#6b7280] text-sm">Please refresh the page or contact support.</p>
          </div>
        </main>
      </div>
    );
  }

  const renderQuestion = () => {
    if (isComplete) {
      return <QuizResults answers={answers} onRestart={handleRestart} />;
    }

    if (!currentQuestion) return null;

    const value = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "text":
      case "number":
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
            value={(value as string) || ""}
            onChange={handleAnswer}
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
            {!showAlreadyCompleted && (
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
                  sections={categories.map(cat => ({
                    id: cat.order,
                    title: cat.title,
                    subtitle: cat.subtitle,
                  }))}
                />
              </div>
            )}

            <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-8 pb-12">
              {showAlreadyCompleted ? (
                <div className="w-full max-w-2xl mx-auto">
                  <div className="block mx-auto max-w-2xl p-6 bg-white my-8 font-sans">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-700 text-center">
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
                          TAKE A TEST AGAIN
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled
                        className="w-[85%] md:w-[70%] justify-center flex bg-[#414042] text-white py-2.5 px-4 text-[16px] md:text-xl lg:text-xl xl:text-xl font-bold rounded-lg uppercase opacity-50 cursor-not-allowed"
                      >
                        <span className="font-[400] uppercase text-center">
                          GO TO RESULT
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={currentIndex}
                  className="w-full animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  {renderQuestion()}
                  {isCheckingUser && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-[#6b7280]">Checking...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
