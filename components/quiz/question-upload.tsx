"use client";

import type { QuizQuestion } from "@/lib/quiz-data";

interface QuestionUploadProps {
  question: QuizQuestion;
  onNext: () => void;
}

export function QuestionUpload({ question, onNext }: QuestionUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center font-sans">
      <div className="block max-w-2xl w-full pt-0 bg-white mx-auto my-4">
        {/* Heading */}
        <div className="w-full px-2">
          <p className="text-[17px] md:text-[24px] mt-0 font-bold text-gray-700 text-left sm:text-center">
            {question.question}
          </p>
          <div className="flex flex-col align-top sm:ml-[20%] font-sans" />
        </div>

        {/* Sample image + hidden file input */}
        <div className="relative mt-5 flex flex-col items-center justify-center w-60 h-60 mx-auto">
          <input
            id={question.id}
            type="file"
            accept="image/*"
            className="absolute top-0 left-0 -z-10 w-full h-full opacity-0 cursor-pointer"
            onChange={onNext}
          />
          <div className="flex flex-col items-center justify-center max-w-full max-h-full">
            <div className="flex flex-col justify-center items-center">
              <img
                alt="Scalp sample"
                src="https://dvv8w2q8s3qot.cloudfront.net/website_images/localImages/scalpi_section/both_view.webp"
                width={190}
                height={190}
                className="object-scale-down align-middle w-44 h-44 rounded-xl bg-[#BCBDC1] cursor-pointer"
              />
              <h2 className="font-sans font-[400] text-[17px] mt-[4px] text-[#5E5E5A] text-center">
                Try clicking a photo like the sample above
              </h2>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="block px-1 py-3 mt-4 flex justify-center items-center uppercase rounded-lg border border-[#2C2C2A] text-[#2C2C2A] xs:text-[12px] lg:text-[18px] cursor-pointer text-center w-[50%]"
          >
            Upload Scalp Photo
          </button>
          <button
            type="button"
            onClick={onNext}
            className="block px-3 py-3 mt-4 flex justify-center items-center uppercase text-white rounded-lg bg-[#2C2C2A] xs:text-[14px] lg:text-[18px] cursor-pointer text-center w-[50%]"
          >
            Take A Picture
          </button>
        </div>
      </div>
    </div>
  );
}
