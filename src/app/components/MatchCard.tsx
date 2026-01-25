import svgPaths from "@/imports/svg-hmknk0ergo";
import { Badge } from "@/app/components/ui/badge";
import { Heart, MapPin, Clock, CircleDollarSign } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface MatchCardProps {
  league: string;
  leagueLogo?: string;
  location: string;
  time: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  potentialReturn?: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  tip?: {
    selection: string;
    odds: number;
    analysis?: string;
    is_premium: boolean;
    market?: string;
    stake?: number;
    confidence?: number;
    bookmaker?: string;
  };
  isUserPremium?: boolean;
}

export function MatchCard({ 
  league, 
  leagueLogo,
  location, 
  time, 
  homeTeam, 
  homeTeamLogo,
  awayTeam, 
  awayTeamLogo,
  potentialReturn, 
  odds,
  isFavorite,
  onToggleFavorite,
  tip,
  isUserPremium
}: MatchCardProps) {
  return (
    <div className={cn("bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6 space-y-4 relative", potentialReturn && "mb-6")}>
      {/* League and Info */}
      <div className="relative flex justify-center items-center">
        <div className="flex items-center gap-2">
          {leagueLogo ? (
            <img src={leagueLogo} alt={league} className="size-[16px] object-contain rounded-full bg-white" />
          ) : (
            <div className="size-[16px] bg-[#dae1e9] rounded-full" />
          )}
          <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">{league}</p>
        </div>
        
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className="absolute right-0 top-0 p-1 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Heart 
              className={cn(
                "size-5 transition-colors", 
                isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
              )} 
            />
          </button>
        )}
      </div>

      {/* Location and Time */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-[#3e4855] tracking-[-0.22px]">
        <div className="flex items-center gap-1">
          <MapPin className="size-3" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{time}</span>
        </div>
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-between">
         {/* Home Team */}
         <div className="flex flex-col items-center gap-2">
           <div className="size-[56px] relative flex items-center justify-center">
            {homeTeamLogo ? (
              <img src={homeTeamLogo} alt={homeTeam} className="size-[56px] object-contain" />
            ) : (
              <div className="size-[56px] bg-[#dae1e9] rounded-full" />
            )}
            
            {/* Online/Status Indicator */}
            <div className="absolute size-[16px] bg-[#c0cddd] rounded-full bottom-0 right-0 flex items-center justify-center border-2 border-white">
              <svg className="size-[8px]" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d={svgPaths.p27424e00} fill="#6A7F98" />
              </svg>
            </div>
          </div>
          <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px] text-center max-w-[104px]">{homeTeam}</p>
        </div>

        {/* VS */}
        <p className="font-semibold text-[24px] text-[#3e4855] tracking-[-1.68px]">VS</p>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2">
           <div className="size-[56px] relative flex items-center justify-center">
            {awayTeamLogo ? (
              <img src={awayTeamLogo} alt={awayTeam} className="size-[56px] object-contain" />
            ) : (
                <div className="size-[56px] bg-[#dae1e9] rounded-full" />
            )}
           </div>
          <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px] text-center max-w-[111px]">{awayTeam}</p>
        </div>
      </div>

      {/* Odds Display */}
      {odds && (
        <div className="flex justify-center gap-2 pt-1">
            <Badge variant="secondary" className="flex gap-2 text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200">
                <span className="text-slate-400 font-medium">1</span>
                <span className="font-bold text-slate-700">{odds.home.toFixed(2)}</span>
            </Badge>
            <Badge variant="secondary" className="flex gap-2 text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200">
                <span className="text-slate-400 font-medium">X</span>
                <span className="font-bold text-slate-700">{odds.draw.toFixed(2)}</span>
            </Badge>
            <Badge variant="secondary" className="flex gap-2 text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200">
                <span className="text-slate-400 font-medium">2</span>
                <span className="font-bold text-slate-700">{odds.away.toFixed(2)}</span>
            </Badge>
        </div>
      )}

      {/* Admin Tip Display */}
      {tip && (
        <div className={cn(
            "mt-3 rounded-lg border p-3",
            tip.is_premium ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
        )}>
            <div className="flex justify-between items-center mb-1">
                <Badge variant={tip.is_premium ? "default" : "secondary"} className={cn("text-[10px] h-5", tip.is_premium ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600 text-white")}>
                    {tip.is_premium ? "PREMIUM PICK" : "FREE PICK"}
                </Badge>
            </div>
            
            {tip.is_premium && !isUserPremium ? (
                 <div className="text-xs text-center py-1 font-medium text-slate-500 flex items-center justify-center gap-1">
                    <span className="text-lg">🔒</span> Access Premium to view this pick
                 </div>
            ) : (
                <>
                    <div className="flex justify-between items-start text-sm font-bold text-slate-800">
                        <div className="flex flex-col">
                           {tip.market && <span className="text-[10px] uppercase tracking-wider font-normal text-slate-500 mb-0.5">{tip.market}</span>}
                           <span>{tip.selection}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs">@{tip.odds.toFixed(2)}</span>
                        </div>
                    </div>

                    {(tip.confidence !== undefined || tip.stake !== undefined) && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                           {tip.confidence !== undefined && (
                               <div className="flex items-center gap-1.5">
                                   <span className="font-medium">Conf:</span>
                                   <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                       <div className={cn("h-full", tip.confidence >= 80 ? "bg-green-500" : tip.confidence >= 60 ? "bg-emerald-500" : "bg-yellow-500")} style={{ width: `${tip.confidence}%` }}></div>
                                   </div>
                               </div>
                           )}
                           {tip.stake !== undefined && (
                               <div className="flex items-center gap-1" title={`Stake ${tip.stake}/10`}>
                                   <span className="font-medium">Stake:</span>
                                   <span className="tracking-tight text-amber-500 text-[9px]">{'★'.repeat(Math.min(tip.stake, 5))}</span>
                               </div>
                           )}
                        </div>
                    )}

                    {tip.analysis && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed border-t border-slate-200/50 pt-2 selection:bg-yellow-100">
                            {tip.analysis}
                        </p>
                    )}
                </>
            )}
        </div>
      )}

      {/* Potential Return Badge */}
      {potentialReturn && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-[#a5b1bf] rounded-[14px] px-4 py-1.5 flex items-center gap-2 shadow-sm">
            <CircleDollarSign className="size-[18px] text-white" />
            <p className="text-[12px] text-white tracking-[-0.24px]">
              <span className="font-semibold">Potential Return </span>
              <span>{potentialReturn}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
