import svgPaths from "@/imports/svg-hmknk0ergo";

interface MatchCardProps {
  league: string;
  location: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  potentialReturn?: string;
}

export function MatchCard({ league, location, time, homeTeam, awayTeam, potentialReturn }: MatchCardProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6 space-y-4">
      {/* League and Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-[16px] bg-[#dae1e9] rounded-full" />
          <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">{league}</p>
        </div>
      </div>

      {/* Location and Time */}
      <div className="flex items-center gap-4 text-[11px] text-[#3e4855] tracking-[-0.22px]">
        <div className="flex items-center gap-1">
          <div className="h-[12px] w-[10px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 12">
              <path d={svgPaths.p3c982900} fill="#3E4855" />
            </svg>
          </div>
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-[11px] w-[12px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 11">
              <path d={svgPaths.p16485b00} fill="#3E4855" />
              <path d={svgPaths.p8179380} fill="#3E4855" />
              <path d={svgPaths.p382b0200} fill="#3E4855" />
              <path d={svgPaths.p18303400} fill="#3E4855" />
            </svg>
          </div>
          <span>{time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2">
          <div className="size-[56px] bg-[#dae1e9] rounded-full relative">
            <div className="absolute size-[16px] bg-[#c0cddd] rounded-full bottom-0 right-0 flex items-center justify-center">
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
          <div className="size-[56px] bg-[#dae1e9] rounded-full" />
          <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px] text-center max-w-[111px]">{awayTeam}</p>
        </div>
      </div>

      {/* Potential Return Badge */}
      {potentialReturn && (
        <div className="flex justify-center">
          <div className="bg-[#a5b1bf] rounded-[14px] px-4 py-1.5 flex items-center gap-2">
            <div className="size-[18px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                <path d={svgPaths.p5c35980} fill="white" />
              </svg>
            </div>
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