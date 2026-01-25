import { X, Check, Trophy } from "lucide-react";
import { useState } from "react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  if (!isOpen) return null;

  const benefits = [
    "More accurate picks, better decision-making",
    "100% access to premium predictions",
    "Bankroll tools to protect and grow your balance",
    "Instant alerts so you never miss a pick",
    "VIP support when you need it",
    "Continuous improvements & new features",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[400px] p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b99ac] hover:text-[#3e4855] transition-colors"
        >
          <X className="size-6" />
        </button>

        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-16 bg-[#dae1e9] rounded-full flex items-center justify-center">
            <Trophy className="size-8 text-[#3e4855]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center font-bold text-[24px] text-[#3e4855] tracking-[-0.72px] mb-2">
          Get Premium
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-4">
          Unlock smarter picks and better accuracy<br />for more consistent results
        </p>

        {/* Statistics */}
        <div className="bg-[#f1f3f5] rounded-[12px] p-3 mb-6 text-center">
          <p className="text-[14px] text-[#3e4855] tracking-[-0.28px]">
            <span className="font-bold text-[20px]">97%</span> of users<br />
            report more Wins with Premium
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 mb-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="size-5 text-[#3e4855] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#3e4855] tracking-[-0.24px]">
                {benefit}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Options */}
        <div className="flex gap-3 mb-6">
          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 border-2 rounded-[16px] p-4 transition-all ${
              selectedPlan === "monthly"
                ? "border-[#3e4855] bg-[#f8f9fa]"
                : "border-[#dae1e9]"
            }`}
          >
            <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-1">
              Monthly
            </p>
            <p className="font-bold text-[20px] text-[#3e4855] tracking-[-0.6px]">
              9.99€
            </p>
            <p className="text-[10px] text-[#8b99ac] tracking-[-0.2px]">
              / month
            </p>
          </button>

          {/* Annual Plan */}
          <button
            onClick={() => setSelectedPlan("annual")}
            className={`flex-1 border-2 rounded-[16px] p-4 transition-all relative ${
              selectedPlan === "annual"
                ? "border-[#3e4855] bg-[#f8f9fa]"
                : "border-[#dae1e9]"
            }`}
          >
            {/* Save Badge */}
            <div className="absolute -top-2 -right-2 bg-[#3e4855] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
              Save 20%
            </div>
            
            {/* Radio indicator */}
            {selectedPlan === "annual" && (
              <div className="absolute top-3 right-3 size-4 bg-[#3e4855] rounded-full flex items-center justify-center">
                <div className="size-2 bg-white rounded-full" />
              </div>
            )}

            <p className="text-[12px] text-[#8b99ac] tracking-[-0.24px] mb-1">
              Annual
            </p>
            <p className="font-bold text-[20px] text-[#3e4855] tracking-[-0.6px]">
              7.99€
            </p>
            <p className="text-[10px] text-[#8b99ac] tracking-[-0.2px]">
              / year
            </p>
          </button>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-[#3e4855] text-white py-4 rounded-[12px] font-semibold text-[14px] tracking-[-0.28px] mb-3 hover:bg-[#2f3840] transition-colors">
          Try Premium free for 7 days
        </button>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-[#8b99ac] tracking-[-0.2px]">
          No commitment, cancel anytime
        </p>
      </div>
    </div>
  );
}
