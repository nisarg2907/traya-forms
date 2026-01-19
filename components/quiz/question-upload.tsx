"use client";

import { useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/use-quiz-data";

interface QuestionUploadProps {
  question: QuizQuestion;
  value?: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function QuestionUpload({ question, value, onChange, onNext }: QuestionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // If there's an existing uploaded URL, include it for cleanup
      if (value) {
        formData.append('oldUrl', value);
      }

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      const imageUrl = result.data?.url;

      if (!imageUrl) {
        throw new Error('No URL returned from upload');
      }

      // Update the answer with the new URL (don't auto-advance)
      onChange(imageUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file inputs so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    // Try to open camera input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      // Clicking on image (sample or uploaded) opens camera
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

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

        {/* Image preview + hidden file inputs */}
        <div className="relative mt-5 flex flex-col items-center justify-center w-60 h-60 mx-auto">
          {/* File picker input (for Upload Scalp Photo) */}
          <input
            ref={fileInputRef}
            id={`${question.id}-file`}
            type="file"
            accept="image/*"
            className="absolute top-0 left-0 -z-10 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {/* Camera input (for Take A Picture) */}
          <input
            ref={cameraInputRef}
            id={`${question.id}-camera`}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center max-w-full max-h-full">
            <div className="flex flex-col justify-center items-center">
              {value && !isUploading ? (
                <img
                  alt="Uploaded scalp photo"
                  src={value}
                  width={190}
                  height={190}
                  className="object-scale-down align-middle w-44 h-44 rounded-xl bg-[#BCBDC1] cursor-pointer"
                  onClick={handleImageClick}
                />
              ) : (
                <img
                  alt="Scalp sample"
                  src="https://dvv8w2q8s3qot.cloudfront.net/website_images/localImages/scalpi_section/both_view.webp"
                  width={190}
                  height={190}
                  className="object-scale-down align-middle w-44 h-44 rounded-xl bg-[#BCBDC1] cursor-pointer"
                  onClick={handleImageClick}
                />
              )}
              {!value && (
                <h2 className="font-sans font-[400] text-[17px] mt-[4px] text-[#5E5E5A] text-center">
                  {isUploading ? 'Uploading...' : 'Try clicking a photo like the sample above'}
                </h2>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center mt-2">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        {value ? (
          // Show Submit button and Change Image button after upload
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="block px-1 py-3 mt-4 flex justify-center items-center uppercase rounded-lg border border-[#2C2C2A] text-[#2C2C2A] xs:text-[12px] lg:text-[18px] cursor-pointer text-center w-[50%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'CHANGE IMAGE'}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={isUploading}
              className="block px-3 py-3 mt-4 flex justify-center items-center uppercase text-white rounded-lg bg-[#2C2C2A] xs:text-[14px] lg:text-[18px] cursor-pointer text-center w-[50%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUBMIT
            </button>
          </div>
        ) : (
          // Show Upload and Take Picture buttons before upload
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="block px-1 py-3 mt-4 flex justify-center items-center uppercase rounded-lg border border-[#2C2C2A] text-[#2C2C2A] xs:text-[12px] lg:text-[18px] cursor-pointer text-center w-[50%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Scalp Photo'}
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isUploading}
              className="block px-3 py-3 mt-4 flex justify-center items-center uppercase text-white rounded-lg bg-[#2C2C2A] xs:text-[14px] lg:text-[18px] cursor-pointer text-center w-[50%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Take A Picture'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
