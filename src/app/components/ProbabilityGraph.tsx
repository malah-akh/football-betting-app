import { DonutChart } from "@/app/components/ui/DonutChart";
import { cn } from "@/app/components/ui/utils";

interface ProbabilityGraphProps {
  odds: {
    home_win: number;
    draw: number;
    away_win: number;
  };
  onSelect?: (selection: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN', odds: number) => void;
  selection?: string | null;
}

const getProb = (decimalOdd: number | undefined | null) => decimalOdd ? Math.round((1 / decimalOdd) * 100) : 0;

export function ProbabilityGraph({ odds, onSelect, selection }: ProbabilityGraphProps) {
  if (!odds) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mb-8">
      {/* Home Win */}
      <div
        onClick={() => onSelect?.('HOME_WIN', odds.home_win)}
        className={cn(
          "flex flex-col items-center cursor-pointer transition-opacity",
          selection === 'HOME_WIN' ? "opacity-100" : selection ? "opacity-70 hover:opacity-100" : ""
        )}
      >
        <DonutChart percentage={getProb(odds.home_win)} color="#505d6f" size={70} strokeWidth={6}>
          <span className="text-[14px] font-bold text-[#3e4855]">{getProb(odds.home_win)}%</span>
        </DonutChart>
        <span className="text-[12px] text-[#6b7280] mt-2 mb-1">Win</span>
        <span className="text-[13px] font-bold text-[#3e4855]">@{odds.home_win?.toFixed(2)}</span>
      </div>

      {/* Draw */}
      <div
        onClick={() => onSelect?.('DRAW', odds.draw)}
        className={cn(
          "flex flex-col items-center cursor-pointer transition-opacity",
          selection === 'DRAW' ? "opacity-100" : selection ? "opacity-70 hover:opacity-100" : ""
        )}
      >
        <DonutChart percentage={getProb(odds.draw)} color="#8b99ac" size={70} strokeWidth={6}>
           <span className="text-[14px] font-bold text-[#3e4855]">{getProb(odds.draw)}%</span>
        </DonutChart>
        <span className="text-[12px] text-[#6b7280] mt-2 mb-1">Draw</span>
        <span className="text-[13px] font-bold text-[#3e4855]">@{odds.draw?.toFixed(2)}</span>
      </div>

      {/* Away Win */}
      <div
        onClick={() => onSelect?.('AWAY_WIN', odds.away_win)}
        className={cn(
          "flex flex-col items-center cursor-pointer transition-opacity",
          selection === 'AWAY_WIN' ? "opacity-100" : selection ? "opacity-70 hover:opacity-100" : ""
        )}
      >
        <DonutChart percentage={getProb(odds.away_win)} color="#505d6f" size={70} strokeWidth={6}>
           <span className="text-[14px] font-bold text-[#3e4855]">{getProb(odds.away_win)}%</span>
        </DonutChart>
        <span className="text-[12px] text-[#6b7280] mt-2 mb-1">Win</span>
        <span className="text-[13px] font-bold text-[#3e4855]">@{odds.away_win?.toFixed(2)}</span>
      </div>
    </div>
  );
}
