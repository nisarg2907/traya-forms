"use client";

interface QuizResultsProps {
  answers: Record<string, string | string[]>;
  onRestart: () => void;
}

export function QuizResults({ answers, onRestart }: QuizResultsProps) {
  const name = (answers.name as string) || "there";

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-[#c5d9b0] flex items-center justify-center mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#6b8e4e]"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-[#2d3748] mb-4">
        Thank you, {name}!
      </h2>

      <p className="text-[#6b7280] text-base mb-8 max-w-md">
        Your personalized hair analysis is being prepared. Our experts will
        review your responses and create a customized treatment plan for you.
      </p>

      <div className="bg-[#c5d9b0]/30 rounded-2xl p-6 w-full mb-8">
        <h3 className="text-lg font-medium text-[#2d3748] mb-3">
          What happens next?
        </h3>
        <ul className="text-left text-[#2d3748] space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#6b8e4e] text-white flex items-center justify-center text-sm flex-shrink-0">
              1
            </span>
            <span>Our hair experts will analyze your responses</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#6b8e4e] text-white flex items-center justify-center text-sm flex-shrink-0">
              2
            </span>
            <span>You will receive a personalized treatment plan</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#6b8e4e] text-white flex items-center justify-center text-sm flex-shrink-0">
              3
            </span>
            <span>A hair coach will contact you within 24 hours</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onRestart}
        className="text-[#6b8e4e] hover:underline font-medium"
      >
        Take the quiz again
      </button>
    </div>
  );
}
