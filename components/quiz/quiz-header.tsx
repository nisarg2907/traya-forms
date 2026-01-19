"use client";

export function QuizHeader() {
  return (
    <header className="h-[6rem] bg-[#414042]">
      <div className="h-full px-4 mx-auto overflow-hidden lg:px-12">
        <div className="h-[4.5rem] flex items-center justify-between">
          <a className="inline-flex items-center cursor-pointer xl:w-auto lg:w-auto md:w-auto w-24">
            <span className="block w-24 h-[30px] relative">
              <img
                alt="traya"
                src="https://form.traya.health/_next/static/media/traya.a5a9cff0.png"
                width={96}
                height={30}
                className="object-contain"
                style={{ width: '96px', height: '30px' }}
              />
            </span>
          </a>
        </div>
        <div className="h-4 -mt-2">
          <p className="text-[14px] font-sans font-[400] pb-1 text-white">
            This hair test is co-created with experts
          </p>
        </div>
      </div>
    </header>
  );
}
