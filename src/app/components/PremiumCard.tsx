import svgPaths from "@/imports/svg-hmknk0ergo";

export function PremiumCard() {
  return (
    <div className="relative bg-[rgba(188,194,201,0.84)] backdrop-blur-[3px] rounded-[20px] p-6 h-[161px] flex items-center justify-center">
      {/* Lock Icon and Text */}
      <div className="flex flex-col items-center gap-3">
        <div className="size-[56px] bg-[#dae1e9] rounded-full relative flex items-center justify-center">
          <div className="h-[29px] w-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 25">
              <path d={svgPaths.p10a45c80} fill="#3E4855" />
              <path d={svgPaths.p1da6b500} fill="#3E4855" />
            </svg>
          </div>
        </div>
        <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.14px]">Premium Pick</p>
      </div>
    </div>
  );
}