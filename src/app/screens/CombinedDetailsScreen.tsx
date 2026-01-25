import { MatchCard } from "@/app/components/MatchCard";
import { Header } from "@/app/components/Header";
import { FilterDrawer, FilterState } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { BottomNav } from "@/app/components/BottomNav";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { Circle, TrendingUp } from "lucide-react";
import { PremiumModal } from "@/app/components/PremiumModal";
import { useState, useMemo } from "react";

export function CombinedDetailsScreen() {
  const matches = [
    {
      id: 1,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
      homeRating: 5,
      awayRating: 5,
      pick: "Both Teams to Score - Yes @ 1.85",
    },
    {
      id: 2,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
      homeRating: 5,
      awayRating: 5,
      pick: "Over 2.5 @ 1.80",
    },
    {
      id: 3,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
      homeRating: 5,
      awayRating: 5,
      pick: "Both Teams to Score - Yes @ 1.85",
    },
  ];

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    country: [],
    league: null,
    hasTip: false,
    premiumOnly: false,
  });

  const availableCountries = useMemo(() => {
     return ["Europe"]; // Mock data
  }, []);

  const availableLeagues = useMemo(() => {
    return Array.from(new Set(matches.map(m => m.league)))
      .sort()
      .map(name => ({ name, country: "Europe" })); // Mock mapping
  }, []);

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative pb-24">
      {/* Header */}
      <Header onFilterClick={() => setIsFilterOpen(true)} />

      {/* Title Section */}
      <div className="px-4 mt-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Matches
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          All your football predictions in one place
        </p>
      </div>

      {/* Tab Bar */}
      <TabBar />

      {/* Date Selector */}
      <DateSelector onFilterClick={() => setIsFilterOpen(true)} />

      {/* Matches List */}
      <div className="flex-1 px-4 mt-6 space-y-4 w-full max-w-3xl mx-auto">
        {/* Match Cards */}
        {matches.map((match) => (
          <div key={match.id} className="relative">
             <MatchCard
                league={match.league}
                location={match.location}
                time={match.time}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                potentialReturn="€33.75"
             />
          </div>
        ))}

        {/* Analysis Section */}
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-[#3e4855]" />
            <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px]">
              Analysis:
            </p>
          </div>
          <p className="text-[10px] text-[#8b99ac] leading-relaxed tracking-[-0.1px]">
            Bayern comes into this match with three straight wins and strong
            offensive play, scoring at least 3 goals in each of those games.
            Manchester United has been inconsistent, but their desire to keep
            their hopes alive in the next stage, making them the clear favourite.
          </p>

          {/* System Info */}
          <div className="border-t border-[#dae1e9] pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-[#3e4855] tracking-[-0.12px]">
                Total System Picks: 3
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#3e4855] tracking-[-0.22px]">
                Total Odds: 0.4
              </p>
            </div>
          </div>

          {/* Suggested Amount */}
          <div className="border-t border-[#dae1e9] pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Circle className="size-3 fill-[#3e4855] stroke-[#3e4855]" />
              <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px]">
                Suggested Amount
              </p>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="border border-[#3e4855] rounded-lg px-4 py-2">
                <span className="text-[14px] font-medium text-[#3e4855]">
                  €38.75
                </span>
              </div>
              <div className="border border-[#3e4855] rounded-lg px-4 py-2">
                <span className="text-[14px] font-medium text-[#3e4855]">
                  1.5%
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-[#8b99ac] tracking-[-0.1px]">
                  Potential return:
                </span>
                <span className="text-[10px] font-black text-[#3e4855]">
                  €82.50
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#3e4855] text-white py-3 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#2f3840] transition-colors">
              Add to My Picks
            </button>

            {/* Disclaimer */}
            <div className="flex gap-2 mt-4">
              <div className="size-4 bg-[#f1f3f5] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-[#8b99ac]">i</span>
              </div>
              <p className="text-[10px] text-[#8b99ac] leading-relaxed tracking-[-0.1px]">
                The bankroll feature is for personal tracking purposes only.
                This app does not place bets or operate with any betting
                operator. All betting decisions are made by the user at their
                own risk.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Card */}
        <PremiumCard />

        {/* Unlock Premium Card */}
        <UnlockPremiumCard onViewPlans={() => setIsPremiumModalOpen(true)} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>

      {/* Premium Modal */}
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentFilters={filters}
        onApply={setFilters}
        onReset={() => setFilters({
            status: "ALL",
            country: [],
            league: null,
            hasTip: false,
            premiumOnly: false,
        })}
        // Pass empty arrays or mocks since this screen has static data
        availableCountries={availableCountries} 
        availableLeagues={availableLeagues}
      />
    </div>
  );
}