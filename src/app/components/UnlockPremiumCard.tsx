import svgPaths from "@/imports/svg-hmknk0ergo";

interface UnlockPremiumCardProps {
  onViewPlans?: () => void;
}

export function UnlockPremiumCard({ onViewPlans }: UnlockPremiumCardProps) {
  return (
    <div className="bg-[#3e4855] rounded-[20px] shadow-[0px_13px_21px_0px_rgba(62,72,85,0.39)] p-6 space-y-6">
      {/* Trophy Icon */}
      <div className="flex justify-center">
        <div className="size-[56px] bg-[#dae1e9] rounded-full flex items-center justify-center">
          <div className="h-[27px] w-[26px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 27">
              <path d={svgPaths.p21275480} fill="#3E4855" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2">
        <p className="font-semibold text-[14px] text-white tracking-[-0.14px]">Unlock Premium Picks</p>
        <p className="text-[12px] text-white tracking-[-0.12px]">Advanced insights to boost your winning potential</p>
      </div>

      {/* View Plans Button */}
      <div className="flex justify-center">
        <button 
          onClick={onViewPlans}
          className="bg-[#c7ccd2] rounded-lg px-6 py-2.5 hover:bg-[#d5d9de] transition-colors"
        >
          <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.36px]">View Plans</p>
        </button>
      </div>
    </div>
  );
}