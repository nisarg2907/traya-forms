"use client";

import { cn } from "@/lib/utils";

interface Section {
  id: number;
  title: string;
  subtitle: string;
}

interface SectionTabsProps {
  currentSection: number;
  progress: number;
  sections?: Section[];
}

const defaultSections: Section[] = [
  { id: 1, title: "About", subtitle: "You" },
  { id: 2, title: "Hair", subtitle: "Health" },
  { id: 3, title: "Internal", subtitle: "Health" },
  { id: 4, title: "Scalp", subtitle: "Assessment" },
];

export function SectionTabs({ currentSection, progress, sections = defaultSections }: SectionTabsProps) {
  // Different active colors for different sections
  const getActiveColor = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return "bg-[#c5d4a8]"; // About You - light olive
      case 2:
        return "bg-[#c5d4a8]"; // Hair Health - light olive  
      case 3:
        return "bg-[#9cb88a]"; // Internal Health - sage green
      case 4:
        return "bg-[#9cb88a]"; // Scalp Assessment - sage green
      default:
        return "bg-[#c5d4a8]";
    }
  };

  return (
    <div className="w-full font-sans">
      {/* Section tabs */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
        {sections.map((section) => {
          // When progress is 100%, all tabs should show as completed
          const isCompleted = progress === 100;
          const isActive = !isCompleted && section.id === currentSection;
          const isPast = isCompleted || section.id < currentSection;

          return (
            <div
              key={section.id}
              className={cn(
                "w-full rounded-md xs:px-2 xs:py-3 sm:px-5 sm:py-3 transition-colors",
                isActive
                  ? getActiveColor(section.id)
                  : isPast
                    ? getActiveColor(section.id) // Use active color for completed sections
                    : "bg-[#e8eae5]"
              )}
            >
              <p
                className={cn(
                  "text-[13px] sm:text-[15px] leading-5 sm:leading-6 font-[400]",
                  (isActive || isPast) ? "text-white" : "text-[#6b7280]"
                )}
              >
                {section.title}
              </p>
              <p
                className={cn(
                  "text-[13px] sm:text-[15px] leading-5 sm:leading-6 font-[400]",
                  (isActive || isPast) ? "text-white" : "text-[#6b7280]"
                )}
              >
                {section.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="px-1.5">
        <p className="mx-auto md:px-[5%] text-[#414042] md:w-[75%] text-[12px] md:text-[14px] font-[400] text-right">
          {progress}%
        </p>
        <div className="mx-auto bg-[#ebebeb] w-full md:w-[65%] h-[5px] xl:h-[8px] mt-0.5 rounded-[5px] overflow-hidden">
          <div
            className={cn(
              "w-full h-[5px] xl:h-[8px] rounded-[5px] transition-all duration-500 ease-out",
              progress === 100 
                ? getActiveColor(sections.length) // Use last section color when 100%
                : getActiveColor(currentSection) // Use current section color
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
