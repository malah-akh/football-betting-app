import svgPaths from "@/imports/svg-hmknk0ergo";

export function DateSelector() {
  return (
    <div className="flex items-center justify-between px-4 mt-6">
      <div className="flex items-center gap-2">
        {/* Calendar Icon */}
        <div className="size-[20px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <path d={svgPaths.pe0dcf00} fill="#3E4855" />
            <path d="M5.33333 10H8V12H5.33333V10Z" fill="#3E4855" />
            <path d={svgPaths.p133f2c00} fill="#3E4855" />
            <path d="M12 10H14.6667V12H12V10Z" fill="#3E4855" />
            <path d={svgPaths.p1d0a9c80} fill="#3E4855" />
            <path d={svgPaths.p5680c80} fill="#3E4855" />
            <path d={svgPaths.p39aa6600} fill="#3E4855" />
          </svg>
        </div>

        {/* Date Buttons */}
        <div className="flex items-center gap-3">
          {/* Today - Active */}
          <button className="bg-[#bcc2c9] rounded-lg px-3 py-1.5">
            <p className="font-bold text-[14px] text-[#3e4855] tracking-[-0.28px]">Today</p>
          </button>

          {/* 12/13 */}
          <button className="border border-[#3e4855] border-solid rounded-lg px-3 py-1.5">
            <p className="font-bold text-[14px] text-[#3e4855] tracking-[-0.28px]">12/13</p>
          </button>

          {/* 12/14 */}
          <button className="border border-[#3e4855] border-solid rounded-lg px-3 py-1.5">
            <p className="font-bold text-[14px] text-[#3e4855] tracking-[-0.28px]">12/14</p>
          </button>
        </div>
      </div>

      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <div className="size-[16px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p12418b00} fill="#3E4855" />
            <path d={svgPaths.p2a58d640} fill="#3E4855" />
            <path d={svgPaths.p274dc200} fill="#3E4855" />
          </svg>
        </div>
        <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">Filter</p>
      </div>
    </div>
  );
}