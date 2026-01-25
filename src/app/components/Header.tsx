import svgPaths from "@/imports/svg-hmknk0ergo";
import { ListFilter } from "lucide-react";

interface HeaderProps {
  onFilterClick?: () => void;
}

export function Header({ onFilterClick }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-4 relative z-40">
      {/* Menu Icon */}
      <div className="flex flex-col gap-2">
        <div className="bg-[#3e4855] h-[3px] w-[30px]" />
        <div className="bg-[#3e4855] h-[3px] w-[24px]" />
        <div className="bg-[#3e4855] h-[3px] w-[18px]" />
      </div>

      <div className="flex items-center gap-3 relative z-50">
        {onFilterClick && (
          <button 
            type="button"
            onClick={onFilterClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Filter"
          >
            <ListFilter className="w-5 h-5 text-[#3e4855] pointer-events-none" />
          </button>
        )}

        {/* Balance Button */}
        <div className="bg-[#c9d1da] rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="size-[18px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
              <g>
                <path d={svgPaths.p5c35980} fill="#3E4855" />
              </g>
            </svg>
          </div>
          <p className="font-bold text-[14px] text-[#3e4855] tracking-[-0.42px]">€1250.00</p>
        </div>
      </div>
    </div>
  );
}
